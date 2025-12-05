import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MaxLength,
} from "class-validator";

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  platform: string;

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
}
