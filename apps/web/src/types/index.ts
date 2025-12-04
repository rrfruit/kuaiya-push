export * from "@repo/db";

export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};
