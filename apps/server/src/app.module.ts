import { join } from 'path'
import { ServeStaticModule } from '@nestjs/serve-static'
import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { BrowserModule } from './modules/browser/browser.module'
import { SocketModule } from './modules/socket/socket.module'
import { PlatformModule } from './modules/platform/platform.module'
import { AccountModule } from './modules/account/account.module'
import { SharedModule } from './shared/shared.module'

@Module({
  imports: [
    SharedModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'www'),
    }),
    ScheduleModule.forRoot(),
    BrowserModule,
    SocketModule,
    PlatformModule,
    AccountModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
