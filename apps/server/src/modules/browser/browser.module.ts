import { Module } from "@nestjs/common";
import { BrowserManagerService } from "./browser-manager.service";
import { BrowserController } from "./browser.controller";

@Module({
  controllers: [BrowserController],
  providers: [BrowserManagerService],
  exports: [BrowserManagerService],
})
export class BrowserModule {}
