import { Injectable, NotFoundException, Logger, BadRequestException } from "@nestjs/common";
import { PrismaService } from "@/shared/prisma.service";
import { FileType, UploadFile } from "@repo/db";
import * as fs from "fs";
import * as path from "path";
import { FindAllUploadDto } from "./dto";
import { type PaginatedResult } from "@repo/shared";

export interface UploadedFileInfo {
  filename: string;
  storageName: string;
  path: string;
  mimeType: string;
  size: number;
  type: FileType;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir: string;

  constructor(private readonly prisma: PrismaService) {
    this.uploadDir = path.join(process.cwd(), "uploads");
    this.ensureUploadDir();
  }

  private ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      this.logger.log(`Created upload directory: ${this.uploadDir}`);
    }
  }

  getUploadDir(): string {
    return this.uploadDir;
  }

  async create(fileInfo: UploadedFileInfo) {
    return this.prisma.uploadFile.create({
      data: fileInfo,
    });
  }

  async findAll() {
    return this.prisma.uploadFile.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findAllPaginated(params: FindAllUploadDto): Promise<PaginatedResult<UploadFile>> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.type) {
      throw new BadRequestException("type is not supported", {
        cause: new Error("type is not supported"),
      });
      where.type = params.type;
    }
    if (params.filename) {
      where.filename = {
        contains: params.filename,
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.uploadFile.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      this.prisma.uploadFile.count({ where }),
    ]);

    return {
      list: data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string) {
    const file = await this.prisma.uploadFile.findUnique({
      where: { id },
    });
    if (!file) {
      throw new NotFoundException(`File with id "${id}" not found`);
    }
    return file;
  }

  async findByType(type: FileType) {
    return this.prisma.uploadFile.findMany({
      where: { type },
      orderBy: { createdAt: "desc" },
    });
  }

  async remove(id: string) {
    const file = await this.findOne(id);

    // 删除物理文件
    const filePath = path.join(this.uploadDir, file.storageName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      this.logger.log(`Deleted file: ${filePath}`);
    }

    // 删除数据库记录
    return this.prisma.uploadFile.delete({
      where: { id },
    });
  }

  getFileType(mimeType: string): FileType {
    if (mimeType.startsWith("image/")) {
      return FileType.IMAGE;
    }
    if (mimeType.startsWith("video/")) {
      return FileType.VIDEO;
    }
    // 默认为图片类型
    return FileType.IMAGE;
  }
}
