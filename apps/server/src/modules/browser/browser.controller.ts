import { Controller, Get, Param, Post, Query, Res, Body } from '@nestjs/common'
import { BrowserManagerService } from './browser-manager.service'
import type { Response } from 'express'
import { NoLogging } from '../../common/decorators/no-logging.decorator'

@Controller('browser')
export class BrowserController {
  constructor(private readonly browserManagerService: BrowserManagerService) {}

  @NoLogging()
  @Get('live/:accountId')
  async getScreenshot(@Param('accountId') accountId: string, @Query('q') quality: number = 60, @Res() res: Response) {
    const screenshotBuffer = await this.browserManagerService.screenshot(accountId, quality)
    res.setHeader('Content-Type', 'image/webp')
    res.send(screenshotBuffer)
  }

  @Post('goto/:accountId')
  async goto(@Param('accountId') accountId: string, @Body('url') url: string) {
    await this.browserManagerService.operate(accountId, async session => {
      await session.page.goto(url)
    })
  }

  @Post('click/:accountId')
  async click(@Param('accountId') accountId: string, @Body('x') x: number, @Body('y') y: number) {
    await this.browserManagerService.operate(accountId, async session => {
      await session.page.mouse.click(x, y)
    })
  }

  @Post('type/:accountId')
  async type(@Param('accountId') accountId: string, @Body('text') text: string) {
    await this.browserManagerService.operate(accountId, async session => {
      await session.page.keyboard.type(text)
    })
  }

  @Post('mouseDown/:accountId')
  async mouseDown(@Param('accountId') accountId: string, @Body('x') x: number, @Body('y') y: number) {
    await this.browserManagerService.operate(accountId, async session => {
      await session.page.mouse.move(x, y)
      await session.page.mouse.down()
    })
  }

  @Post('mouseUp/:accountId')
  async mouseUp(@Param('accountId') accountId: string) {
    await this.browserManagerService.operate(accountId, async session => {
      await session.page.mouse.up()
    })
  }

  @Post('mouseMove/:accountId')
  async mouseMove(@Param('accountId') accountId: string, @Body('x') x: number, @Body('y') y: number) {
    await this.browserManagerService.operate(accountId, async session => {
      await session.page.mouse.move(x, y)
    })
  }
}
