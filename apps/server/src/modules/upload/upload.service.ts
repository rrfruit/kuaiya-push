import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { PrismaService } from "@/shared/prisma.service";
import { FileType } from "@repo/db";
import * as fs from "fs";
import * as path from "path";

export interface UploadedFileInfo {
  filename: string;
  storageName: string;
  path: string;
  mimeType: string;
  size: number;
  type: FileType;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  type?: FileType;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
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

  async findAllPaginated(params: PaginationParams): Promise<PaginatedResult<any>> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where = params.type ? { type: params.type } : {};

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
      data,
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
