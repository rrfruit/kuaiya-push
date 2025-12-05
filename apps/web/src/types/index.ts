export type * from "@repo/db/types";

export type * from "./withRelations";

export type * from "@repo/shared";

export type Platform = {
  name: string;
  code: string;
};

export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};


