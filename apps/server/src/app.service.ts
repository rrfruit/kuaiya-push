import { Injectable } from "@nestjs/common";
import { PrismaService } from "@repo/db";

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getHello() {
    return "Hello World";
  }
}
