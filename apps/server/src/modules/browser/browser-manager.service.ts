import * as path from 'path'
import { Browser, Page } from 'puppeteer'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import lock from '../../common/utils/lock'

puppeteer.use(StealthPlugin())

const INACTIVE_TIMEOUT_MS = 30 * 60 * 1000 // 30 分钟

export const VIEWPORT_WIDTH = 1280
export const VIEWPORT_HEIGHT = 800

// 增加 lastActivity 和一个可选的销毁计时器ID
interface BrowserSession {
  accountId: string
  browser: Browser
  page: Page
  lastActivity: number // UNIX a时间戳 (毫秒)
}

@Injectable()
export class BrowserManagerService implements OnApplicationShutdown {
  private readonly logger = new Logger(BrowserManagerService.name)
  private readonly sessions = new Map<string, BrowserSession>()
  private readonly userDataBaseDir = path.join(process.cwd(), 'user_data')

  async screenshot(accountId: string, quality: number = 60) {
    const session = await this.getSession(accountId)
    return await session.page.screenshot({
      type: 'webp',
      quality: Number(quality),
      fullPage: true,
    })
  }

  async operate<T>(
    accountId: string,
    fn: (session: BrowserSession) => Promise<T>,
    {
      expireTime = 60 * 10, // 10分钟
      retryTimeout = 100_000,
      retryInterval = 100,
    }: {
      expireTime?: number
      retryTimeout?: number
      retryInterval?: number
    } = {},
  ): Promise<T> {
    return await lock.run(
      accountId,
      async () => {
        const startTime = Date.now()
        const session = await this.getSession(accountId)
        const result = await fn(session)
        this.logger.debug(`Browser Operation account: ${accountId} duration: ${Date.now() - startTime}ms`)
        return result
      },
      {
        expireTime,
        retryTimeout,
        retryInterval,
      },
    )
  }

  private async setPageProperties(page: Page) {
    await page.setViewport({ width: 1280, height: 800 })

    // 反检测：隐藏 webdriver 标识
    await page.evaluateOnNewDocument(() => {
      // 删除 navigator.webdriver 属性
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      })

      // @ts-expect-error 覆盖 Chrome 对象
      window.navigator.chrome = {
        runtime: {},
      }

      // 覆盖 permissions 查询
      const originalQuery = window.navigator.permissions.query
      window.navigator.permissions.query = parameters =>
        parameters.name === 'notifications'
          ? Promise.resolve({
              state: Notification.permission,
            } as PermissionStatus)
          : originalQuery(parameters)

      // 覆盖 plugins 长度
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      })

      // 覆盖 languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['zh-CN', 'zh', 'en-US', 'en'],
      })
    })

    // 设置更真实的 User-Agent
    await page.setUserAgent({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      userAgentMetadata: {
        brands: [
          { brand: 'Google Chrome', version: '120' },
          { brand: 'Chromium', version: '120' },
          { brand: 'Not(A:Brand', version: '24' },
        ],
        fullVersionList: [
          { brand: 'Google Chrome', version: '120.0.0.0' },
          { brand: 'Chromium', version: '120.0.0.0' },
          { brand: 'Not(A:Brand', version: '24.0.0.0' },
        ],
        platform: 'macOS',
        platformVersion: '10.15.7',
        architecture: 'x86',
        model: '',
        mobile: false,
      },
    })

    // 设置额外的 headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'zh-CN;q=0.8,zh;q=0.9,en-US,en;q=0.7',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    })

    return page
  }

  /**
   * 获取或创建一个用户的浏览器会话
   * 同时初始化活动时间戳
   */
  private async getSession(accountId: string): Promise<BrowserSession> {
    if (this.sessions.has(accountId)) {
      const session = this.sessions.get(accountId)!
      // 即便只是重新连接，也算作一次活动
      this.updateActivity(accountId)
      return session
    }

    this.logger.log(`Creating new session for user: ${accountId}`)
    const userDir = path.join(this.userDataBaseDir, accountId)

    const browser = await puppeteer.launch({
      userDataDir: userDir,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        // 反检测相关参数
        '--disable-blink-features=AutomationControlled', // 禁用自动化控制标识
        '--disable-features=IsolateOrigins,site-per-process',
        '--window-size=1280,800',
      ],
    })
    const page = (await browser.pages())[0] || (await browser.newPage())

    await this.setPageProperties(page)

    const session: BrowserSession = {
      accountId,
      browser,
      page,
      lastActivity: Date.now(), // 初始化活动时间
    }
    this.sessions.set(accountId, session)

    // 监听新标签页创建
    browser.on('targetcreated', async target => {
      if (target.type() === 'page') {
        const newPage = await target.page()
        if (newPage) {
          this.logger.log(`New page created for user ${accountId}`)
          await session.page.close()
          await this.setPageProperties(newPage)
          session.page = newPage
        }
      }
    })

    // 监听标签页销毁
    browser.on('targetdestroyed', async target => {
      if (target.type() === 'page') {
        if ((await browser.pages()).length === 0) {
          this.closeSession(accountId)
        }
      }
    })

    // 监听浏览器断开连接
    browser.on('disconnected', () => {
      this.logger.warn(`Browser for user ${accountId} has disconnected.`)
      this.sessions.delete(accountId)
    })

    return session
  }

  /**
   * 更新指定用户的最后活动时间
   * @param accountId
   */
  updateActivity(accountId: string): void {
    const session = this.sessions.get(accountId)
    if (session) {
      session.lastActivity = Date.now()
      this.logger.debug(`Activity updated for user: ${accountId}`)
    }
  }

  /**
   * 关闭并清理一个用户的会话
   * @param accountId
   */
  async closeSession(accountId: string): Promise<void> {
    const session = this.sessions.get(accountId)
    if (session) {
      this.logger.log(`Closing session for user ${accountId} due to inactivity.`)
      try {
        // 等待一小段时间，确保数据写入磁盘
        await new Promise(resolve => setTimeout(resolve, 500))
        await session.browser.close()
      } catch (error) {
        this.logger.error(`Error closing browser for ${accountId}:`, error)
      } finally {
        this.sessions.delete(accountId)
      }
    }
  }

  /**
   * [新增] 定时任务：每分钟检查一次闲置会话
   */
  @Cron(CronExpression.EVERY_MINUTE)
  checkInactiveSessions() {
    const now = Date.now()
    for (const [accountId, session] of this.sessions.entries()) {
      const inactiveDuration = now - session.lastActivity

      if (inactiveDuration > INACTIVE_TIMEOUT_MS) {
        this.logger.warn(`User '${accountId}' has been inactive for ${Math.floor(inactiveDuration / 60000)} minutes.`)
        this.closeSession(accountId).catch(err => {
          this.logger.error(`Failed to close inactive session for ${accountId}:`, err)
        })
      }
    }
  }

  /**
   * 在应用程序关闭时，优雅地关闭所有浏览器实例
   */
  async onApplicationShutdown(signal?: string) {
    this.logger.log(`Shutting down all browser sessions due to ${signal}...`)
    const closingPromises: Promise<void>[] = []
    for (const accountId of this.sessions.keys()) {
      closingPromises.push(this.closeSession(accountId))
    }
    await Promise.all(closingPromises)
    this.logger.log('All browser sessions closed.')
  }
}
