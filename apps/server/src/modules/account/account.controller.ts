import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import { AccountStatus } from "@repo/db";
import { AccountService } from "./account.service";
import { CreateAccountDto, UpdateAccountDto } from "./dto";

@Controller("account")
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountService.create(createAccountDto);
  }

  @Get()
  findAll(@Query("platformId") platformId?: string) {
    if (platformId) {
      return this.accountService.findByPlatform(platformId);
    }
    return this.accountService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.accountService.findOne(id);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountService.update(id, updateAccountDto);
  }

  @Put(":id/status")
  updateStatus(@Param("id") id: string, @Body("status") status: AccountStatus) {
    return this.accountService.updateStatus(id, status);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.accountService.remove(id);
  }
}
