import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  IsInt,
  IsBoolean,
  IsDateString,
  Min,
  Max,
} from "class-validator";
import { ProxyType } from "@repo/db";

export class CreateProxyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(ProxyType)
  @IsNotEmpty()
  type: ProxyType;

  @IsString()
  @IsNotEmpty()
  host: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  port: number;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  location?: string;

  @IsDateString()
  @IsOptional()
  expireAt?: string;

  @IsString()
  @IsOptional()
  remark?: string;
}
