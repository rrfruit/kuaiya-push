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
import { FindAllUploadDto } from "./dto";

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
  findAll(@Query() query: FindAllUploadDto) {
    return this.uploadService.findAllPaginated(query);
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
