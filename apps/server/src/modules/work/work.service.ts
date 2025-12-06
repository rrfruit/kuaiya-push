import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/shared/prisma.service";
import { CreateWorkDto, UpdateWorkDto } from "./dto";

@Injectable()
export class WorkService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createWorkDto: CreateWorkDto) {
    return this.prisma.work.create({
      data: createWorkDto,
    });
  }

  async findAll() {
    return this.prisma.work.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const work = await this.prisma.work.findUnique({
      where: { id },
    });
    if (!work) {
      throw new NotFoundException(`Work with id "${id}" not found`);
    }
    return work;
  }

  async update(id: string, updateWorkDto: UpdateWorkDto) {
    // 确保作品存在
    await this.findOne(id);

    return this.prisma.work.update({
      where: { id },
      data: updateWorkDto,
    });
  }

  async remove(id: string) {
    // 确保作品存在
    await this.findOne(id);

    return this.prisma.work.delete({
      where: { id },
    });
  }
}
