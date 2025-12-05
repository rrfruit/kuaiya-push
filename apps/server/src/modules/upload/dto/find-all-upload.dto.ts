import { IsString, IsOptional, IsNumberString, IsNumber } from "class-validator";
import { FileType } from "@repo/db";

export class FindAllUploadDto {
  @IsNumberString()
  @IsOptional()
  type?: FileType;

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  pageSize?: number;

  @IsString()
  @IsOptional()
  filename?: string;
}
