import path from 'path'
import { PrismaClient } from '../generated/client'

import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    const datasourceUrl = path.join(__dirname, '../prisma', 'data.db')
    super({
      log: ['error'],
    })
    this.logger.log('DATABASE_URL: ' + datasourceUrl)
  }

  async onModuleInit() {
    await this.$connect()
    this.logger.log('Database connection established successfully')
  }

  async onModuleDestroy() {
    await this.$disconnect()
    this.logger.log('Database connection closed')
  }
}
