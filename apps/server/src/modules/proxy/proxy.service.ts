import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/shared/prisma.service";
import { CreateProxyDto, UpdateProxyDto } from "./dto";

@Injectable()
export class ProxyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProxyDto: CreateProxyDto) {
    return this.prisma.proxy.create({
      data: {
        ...createProxyDto,
        expireAt: createProxyDto.expireAt
          ? new Date(createProxyDto.expireAt)
          : undefined,
      },
      include: {
        _count: {
          select: { accounts: true },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.proxy.findMany({
      include: {
        _count: {
          select: { accounts: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const proxy = await this.prisma.proxy.findUnique({
      where: { id },
      include: {
        _count: {
          select: { accounts: true },
        },
      },
    });
    if (!proxy) {
      throw new NotFoundException(`Proxy with id "${id}" not found`);
    }
    return proxy;
  }

  async update(id: string, updateProxyDto: UpdateProxyDto) {
    // 确保代理存在
    await this.findOne(id);

    return this.prisma.proxy.update({
      where: { id },
      data: {
        ...updateProxyDto,
        expireAt: updateProxyDto.expireAt
          ? new Date(updateProxyDto.expireAt)
          : undefined,
      },
      include: {
        _count: {
          select: { accounts: true },
        },
      },
    });
  }

  async remove(id: string) {
    // 确保代理存在
    await this.findOne(id);

    return this.prisma.proxy.delete({
      where: { id },
    });
  }

  // 更新最后使用时间
  async updateLastUsedAt(id: string) {
    return this.prisma.proxy.update({
      where: { id },
      data: { lastUsedAt: new Date() },
    });
  }
}
