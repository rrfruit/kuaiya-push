import { IsString, IsOptional, IsNotEmpty, IsEnum } from "class-validator";
import { WorkType } from "@repo/db";

export class CreateWorkDto {
  @IsEnum(WorkType)
  @IsNotEmpty()
  type: WorkType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  mediaUrl?: string;

  @IsString()
  @IsOptional()
  coverUrl?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  imgs?: string;
}
