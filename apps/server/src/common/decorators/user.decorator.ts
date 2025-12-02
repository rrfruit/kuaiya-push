import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const User = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // 如果指定了data，则返回user对象中对应的属性
    return data ? user?.[data] : user;
  },
);
