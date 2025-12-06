import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { WorkService } from "./work.service";
import { CreateWorkDto, UpdateWorkDto } from "./dto";

@Controller("work")
export class WorkController {
  constructor(private readonly workService: WorkService) {}

  @Post()
  create(@Body() createWorkDto: CreateWorkDto) {
    return this.workService.create(createWorkDto);
  }

  @Get()
  findAll() {
    return this.workService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.workService.findOne(id);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() updateWorkDto: UpdateWorkDto) {
    return this.workService.update(id, updateWorkDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.workService.remove(id);
  }
}
