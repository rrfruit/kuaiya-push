import request from "@/lib/request";
import { Platform } from "@repo/db/types";

export function getPlatforms() {
  return request<Platform[]>("/platform", {
    method: "GET",
  });
}

export function getPlatform(id: string) {
  return request<Platform>(`/platform/${id}`, {
    method: "GET",
  });
}

