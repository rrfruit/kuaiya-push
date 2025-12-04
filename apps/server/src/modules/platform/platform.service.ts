import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "@/shared/prisma.service";
import { CreatePlatformDto, UpdatePlatformDto } from "./dto";

@Injectable()
export class PlatformService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPlatformDto: CreatePlatformDto) {
    // 检查 code 是否已存在
    const existing = await this.prisma.platform.findUnique({
      where: { code: createPlatformDto.code },
    });
    if (existing) {
      throw new ConflictException(
        `Platform with code "${createPlatformDto.code}" already exists`,
      );
    }

    return this.prisma.platform.create({
      data: createPlatformDto,
    });
  }

  async findAll() {
    return this.prisma.platform.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const platform = await this.prisma.platform.findUnique({
      where: { id },
    });
    if (!platform) {
      throw new NotFoundException(`Platform with id "${id}" not found`);
    }
    return platform;
  }

  async findByCode(code: string) {
    const platform = await this.prisma.platform.findUnique({
      where: { code },
    });
    if (!platform) {
      throw new NotFoundException(`Platform with code "${code}" not found`);
    }
    return platform;
  }

  async update(id: string, updatePlatformDto: UpdatePlatformDto) {
    // 确保平台存在
    await this.findOne(id);

    // 如果更新 code，检查新 code 是否已被其他平台使用
    if (updatePlatformDto.code) {
      const existing = await this.prisma.platform.findFirst({
        where: {
          code: updatePlatformDto.code,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException(
          `Platform with code "${updatePlatformDto.code}" already exists`,
        );
      }
    }

    return this.prisma.platform.update({
      where: { id },
      data: updatePlatformDto,
    });
  }

  async remove(id: string) {
    // 确保平台存在
    await this.findOne(id);

    return this.prisma.platform.delete({
      where: { id },
    });
  }
}
