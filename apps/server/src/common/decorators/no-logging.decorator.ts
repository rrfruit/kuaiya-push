import { SetMetadata } from "@nestjs/common";

export const NO_LOGGING_KEY = "noLogging";
export const NoLogging = () => SetMetadata(NO_LOGGING_KEY, true);
