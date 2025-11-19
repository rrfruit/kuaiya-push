interface LockItem {
  key: string
  expireTime: number
}

class Lock {
  private timer: NodeJS.Timeout
  private locks = new Map<string, LockItem>()

  constructor() {
    this.timer = setInterval(() => {
      this.locks.forEach(lock => {
        if (lock.expireTime < Date.now()) {
          this.locks.delete(lock.key)
        }
      })
    }, 1000_000)
    this.timer.unref()
  }

  public async acquire(
    key: string,
    expireTime = 100, // 秒
    retryTimeout = 100_000, // 100秒
    retryInterval = 100, // 100ms
  ) {
    const startTime = Date.now()
    while (Date.now() - startTime < retryTimeout) {
      // 尝试获取锁
      const result = await this.createLock(key, expireTime)
      if (result) {
        return result
      }
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, retryInterval))
    }
    return null
  }

  private async createLock(key: string, expireTime: number): Promise<LockItem | null> {
    const item = this.locks.get(key)
    if (item && item.expireTime > Date.now()) {
      return null
    }
    const lock: LockItem = { key, expireTime: Date.now() + expireTime * 1000 }
    this.locks.set(key, lock)
    return lock
  }

  public async release(key: string) {
    const lock = this.locks.get(key)
    if (lock) {
      this.locks.delete(key)
    }
  }

  public async run<T>(
    key: string,
    fn: () => Promise<T>,
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
    const lock = await this.acquire(key, expireTime, retryTimeout, retryInterval)
    if (lock) {
      try {
        return await fn()
      } finally {
        this.release(key)
      }
    }
    throw new Error('Lock acquisition failed')
  }
}

export default new Lock()
