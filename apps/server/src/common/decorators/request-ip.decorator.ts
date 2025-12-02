import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const RequestIp = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.ip;
  },
);
