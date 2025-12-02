import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { CreatePlatformDto, UpdatePlatformDto } from "./dto";
import { PlatformService } from "./platform.service";

@Controller("platform")
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @Post()
  create(@Body() createPlatformDto: CreatePlatformDto) {
    return this.platformService.create(createPlatformDto);
  }

  @Get()
  findAll() {
    return this.platformService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.platformService.findOne(id);
  }

  @Get("code/:code")
  findByCode(@Param("code") code: string) {
    return this.platformService.findByCode(code);
  }

  @Put(":id")
  update(
    @Param("id") id: string,
    @Body() updatePlatformDto: UpdatePlatformDto,
  ) {
    return this.platformService.update(id, updatePlatformDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.platformService.remove(id);
  }
}
