import { NestFactory, Reflector } from '@nestjs/core'
import { WinstonModule } from 'nest-winston'
import { createLogger } from 'winston'
import { AppModule } from './app.module'
import { winstonConfig } from './winston/winston.config'
import { ClassSerializerInterceptor } from '@nestjs/common'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    logger: WinstonModule.createLogger({
      instance: createLogger(winstonConfig),
    }),
  })

  app.enableShutdownHooks()
  app.setGlobalPrefix('api')
  app.useGlobalInterceptors(
    new LoggingInterceptor(app.get(Reflector)),
    new TransformInterceptor(app.get(Reflector)),
    new ClassSerializerInterceptor(app.get(Reflector)),
  )

  await app.listen(3000)
}
bootstrap().catch(err => {
  console.error('Failed to start application:', err)
  process.exit(1)
})
