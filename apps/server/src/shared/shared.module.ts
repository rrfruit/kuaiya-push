import type { Provider } from "@nestjs/common";
import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

const providers: Provider[] = [PrismaService];

@Global()
@Module({
  providers,
  imports: [],
  exports: [...providers],
})
export class SharedModule {}
