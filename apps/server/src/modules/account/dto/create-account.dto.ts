import {
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  MaxLength,
} from "class-validator";
import { AccountStatus } from "@repo/db";

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  platformId: string;

  @IsString()
  @IsOptional()
  proxyId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  displayName: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  coverUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  platformUserId?: string;

  @IsEnum(AccountStatus)
  @IsOptional()
  status?: AccountStatus;
}
