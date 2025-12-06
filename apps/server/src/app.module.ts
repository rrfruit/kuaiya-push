import { join } from "path";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { ServeStaticModule } from "@nestjs/serve-static";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AccountModule } from "./modules/account/account.module";
import { BrowserModule } from "./modules/browser/browser.module";
import { SocketModule } from "./modules/socket/socket.module";
import { UploadModule } from "./modules/upload/upload.module";
import { WorkModule } from "./modules/work/work.module";
import { SharedModule } from "./shared/shared.module";

@Module({
  imports: [
    SharedModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot(
      {
        rootPath: join(process.cwd(), "www"),
        serveRoot: "/web",
      },
      {
        rootPath: join(process.cwd(), "uploads"),
        serveRoot: "/uploads",
      },
    ),
    ScheduleModule.forRoot(),
    BrowserModule,
    SocketModule,
    AccountModule,
    UploadModule,
    WorkModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
