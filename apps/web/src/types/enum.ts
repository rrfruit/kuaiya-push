import { AccountStatus } from "./index";

export const AccountStatusEnum: Record<AccountStatus, AccountStatus> = {
  NOT_LOGGED_IN: "NOT_LOGGED_IN",
  LOGGED_IN: "LOGGED_IN",
  LOGIN_EXPIRED: "LOGIN_EXPIRED",
};
