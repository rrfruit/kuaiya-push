import { WinstonModule } from "nest-winston";
import { createLogger } from "winston";
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  HttpStatus,
  UnprocessableEntityException,
} from "@nestjs/common";
import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { winstonConfig } from "./winston/winston.config";
import { SocketGateway } from "./modules/socket/socket.gateway";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    logger: WinstonModule.createLogger({
      instance: createLogger(winstonConfig),
    }),
  });

  app.enableShutdownHooks();
  app.setGlobalPrefix("api");

  app.useGlobalInterceptors(
    new LoggingInterceptor(app.get(Reflector)),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      transform: true,
      dismissDefaultMessages: true,
      exceptionFactory: (errors) => {
        return new UnprocessableEntityException(errors.toString());
      },
    }),
  );

  // 获取底层 HTTP 服务器并初始化 WebSocket
  const server = app.getHttpServer();
  const socketGateway = app.get(SocketGateway);
  socketGateway.init(server);

  await app.listen(3000);
}
bootstrap().catch((err) => {
  console.error("Failed to start application:", err);
  process.exit(1);
});
