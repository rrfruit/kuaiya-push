import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { v4 as uuidv4 } from "uuid";
import { FileType } from "@repo/db";
import { UploadService } from "./upload.service";

// 100MB 最大文件大小
const MAX_FILE_SIZE = 100 * 1024 * 1024;

// 支持的文件类型
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
];

@Controller("upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (req, file, cb) => {
          // 动态获取上传目录
          const uploadDir =
            (req as any).uploadService?.getUploadDir() ||
            process.cwd() + "/uploads";
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `不支持的文件类型: ${file.mimetype}。支持的类型: ${ALLOWED_MIME_TYPES.join(", ")}`,
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    }),
  )
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({
            fileType: new RegExp(
              `(${ALLOWED_MIME_TYPES.map((t) => t.replace("/", "\\/")).join("|")})`,
            ),
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const fileType = this.uploadService.getFileType(file.mimetype);

    const uploadedFile = await this.uploadService.create({
      filename: file.originalname,
      storageName: file.filename,
      path: `/uploads/${file.filename}`,
      mimeType: file.mimetype,
      size: file.size,
      type: fileType,
    });

    return uploadedFile;
  }

  @Get()
  findAll(@Query("type") type?: string) {
    if (type && Object.values(FileType).includes(type as FileType)) {
      return this.uploadService.findByType(type as FileType);
    }
    return this.uploadService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.uploadService.findOne(id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.uploadService.remove(id);
  }
}
