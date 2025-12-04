import path from "path";
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { PrismaClient } from "@repo/db";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const datasourceUrl = path.join(
      __dirname,
      "../../../../packages/db/data.db",
    );
    console.log("datasourceUrl: ", datasourceUrl);
    super({
      log: ["error"],
      datasourceUrl: `file:${datasourceUrl}`,
    });
    this.logger.log("DATABASE_URL: " + datasourceUrl);
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log("Database connection established successfully");
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log("Database connection closed");
  }
}
