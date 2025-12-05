import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SKIP_TRANSFORM_INTERCEPTOR } from "../decorators/skip-transform.decorator";

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 检查是否需要跳过转换
    const skipTransform = this.reflector.get<boolean>(
      SKIP_TRANSFORM_INTERCEPTOR,
      context.getHandler(),
    );

    if (skipTransform) {
      return next.handle();
    }

    // 默认同步处理
    return next.handle().pipe(
      map((data) => ({
        code: 0,
        message: "success",
        data,
      })),
    );
  }
}
