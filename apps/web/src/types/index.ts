export type * from "@repo/db/types";

export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};


