import request from "@/lib/request";
import { AccountWithRelations, Account } from "@/types";

export interface CreateAccountDto {
  platform: string;
  displayName: string;
  proxyId?: string;
  coverUrl?: string;
  platformUserId?: string;
}

export type UpdateAccountDto = Partial<CreateAccountDto>;

export function getAccounts(platform?: string) {
  return request<AccountWithRelations[]>("/account", {
    params: { platform },
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

export function deleteAccount(id: string) {
  return request<void>(`/account/${id}`, {
    method: "DELETE",
  });
}

export function deleteAccounts(ids: string[]) {
  return request<{ count: number }>("/account/batch-delete", {
    method: "POST",
    data: { ids },
  });
}
