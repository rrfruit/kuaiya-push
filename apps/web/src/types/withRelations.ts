import { Account, Platform, Proxy } from "./index";

export type AccountWithRelations = Account & {
  platform?: Platform;
  proxy?: Proxy;
};