import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { ProxyService } from "./proxy.service";
import { CreateProxyDto, UpdateProxyDto } from "./dto";

@Controller("proxy")
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post()
  create(@Body() createProxyDto: CreateProxyDto) {
    return this.proxyService.create(createProxyDto);
  }

  @Get()
  findAll() {
    return this.proxyService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.proxyService.findOne(id);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() updateProxyDto: UpdateProxyDto) {
    return this.proxyService.update(id, updateProxyDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.proxyService.remove(id);
  }

  @Post("batch-delete")
  removeMany(@Body() body: { ids: string[] }) {
    return this.proxyService.removeMany(body.ids);
  }
}
