import request from "@/lib/request";
import { Account, AccountStatus } from "@repo/db/types";

export interface CreateAccountDto {
  platformId: string;
  displayName: string;
  proxyId?: string;
  coverUrl?: string;
  platformUserId?: string;
  status?: AccountStatus;
}

export type UpdateAccountDto = Partial<CreateAccountDto>;

export function getAccounts(platformId?: string) {
  return request<Account[]>("/account", {
    params: { platformId },
    method: "GET",
  });
}

export function getAccount(id: string) {
  return request<Account>(`/account/${id}`, {
    method: "GET",
  });
}

export function createAccount(data: CreateAccountDto) {
  return request<Account>("/account", {
    method: "POST",
    data,
  });
}

export function updateAccount(id: string, data: UpdateAccountDto) {
  return request<Account>(`/account/${id}`, {
    method: "PUT",
    data,
  });
}

export function updateAccountStatus(id: string, status: AccountStatus) {
  return request<Account>(`/account/${id}/status`, {
    method: "PUT",
    data: { status },
  });
}

export function deleteAccount(id: string) {
  return request<void>(`/account/${id}`, {
    method: "DELETE",
  });
}
