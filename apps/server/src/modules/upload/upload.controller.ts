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
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { v4 as uuidv4 } from "uuid";
import { FileType } from "@repo/db";
import { UploadService } from "./upload.service";

// 100MB 最大文件大小
const MAX_FILE_SIZE = 1000 * 1024 * 1024;


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
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    }),
  )
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE })
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
  findAll(
    @Query("type") type?: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 10;
    const fileType = type && Object.values(FileType).includes(type as FileType)
      ? (type as FileType)
      : undefined;

    return this.uploadService.findAllPaginated({
      page: pageNum,
      pageSize: pageSizeNum,
      type: fileType,
    });
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
