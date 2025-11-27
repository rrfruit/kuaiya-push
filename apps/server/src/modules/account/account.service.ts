import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '@repo/db'
import { CreateAccountDto, UpdateAccountDto } from './dto'

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAccountDto: CreateAccountDto) {
    return this.prisma.account.create({
      data: createAccountDto,
      include: {
        platform: true,
        proxy: true,
      },
    })
  }

  async findAll() {
    return this.prisma.account.findMany({
      include: {
        platform: true,
        proxy: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findByPlatform(platformId: string) {
    return this.prisma.account.findMany({
      where: { platformId },
      include: {
        platform: true,
        proxy: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string) {
    const account = await this.prisma.account.findUnique({
      where: { id },
      include: {
        platform: true,
        proxy: true,
      },
    })
    if (!account) {
      throw new NotFoundException(`Account with id "${id}" not found`)
    }
    return account
  }

  async update(id: string, updateAccountDto: UpdateAccountDto) {
    // 确保账号存在
    await this.findOne(id)

    return this.prisma.account.update({
      where: { id },
      data: updateAccountDto,
      include: {
        platform: true,
        proxy: true,
      },
    })
  }

  async remove(id: string) {
    // 确保账号存在
    await this.findOne(id)

    return this.prisma.account.delete({
      where: { id },
    })
  }

  async updateStatus(id: string, status: CreateAccountDto['status']) {
    await this.findOne(id)

    return this.prisma.account.update({
      where: { id },
      data: {
        status,
        lastSyncedAt: new Date(),
      },
      include: {
        platform: true,
        proxy: true,
      },
    })
  }
}
