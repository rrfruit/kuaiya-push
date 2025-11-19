import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { getIpAddress } from '../utils/getIpAddress'
import { NO_LOGGING_KEY } from '../decorators/no-logging.decorator'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP')

  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const noLogging = this.reflector.get<boolean>(NO_LOGGING_KEY, context.getHandler())

    if (noLogging) {
      return next.handle()
    }

    const request = context.switchToHttp().getRequest()
    const { method, route } = request
    const now = Date.now()
    const requestIp = getIpAddress(request)

    this.logger.verbose(`>>> ${requestIp} ${method} ${route.path}`)

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse()
        const delay = Date.now() - now
        this.logger.verbose(`<<< ${requestIp} ${method} ${route.path} ${response.statusCode} ${delay}ms`)
      }),
    )
  }
}
