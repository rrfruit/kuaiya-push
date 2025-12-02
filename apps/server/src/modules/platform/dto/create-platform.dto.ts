import {
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  MaxLength,
} from "class-validator";
import { PlatformStatus } from "@repo/db";

export class CreatePlatformDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  apiBaseUrl?: string;

  @IsEnum(PlatformStatus)
  @IsOptional()
  status?: PlatformStatus;
}
