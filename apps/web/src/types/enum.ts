import { PublishStatus } from "./index";

export const PublishStatusEnum: Record<PublishStatus, PublishStatus> = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
};
