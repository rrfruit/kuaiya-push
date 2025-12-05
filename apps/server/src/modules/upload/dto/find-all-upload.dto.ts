import { IsString, IsOptional, IsNumber, IsEnum } from "class-validator";
import { Type } from "class-transformer";
import { FileType } from "@repo/db";

export class FindAllUploadDto {
  @IsEnum(FileType)
  @IsOptional()
  type?: FileType;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  page?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  pageSize?: number;

  @IsString()
  @IsOptional()
  filename?: string;
}
