import request from "@/lib/request";
import { Proxy, ProxyType } from "@/types";

export type ProxyWithCount = Proxy & {
  _count: {
    accounts: number;
  };
};

export interface CreateProxyDto {
  name?: string;
  type: ProxyType;
  host: string;
  port: number;
  username?: string;
  password?: string;
  isActive?: boolean;
  location?: string;
  expireAt?: string;
  remark?: string;
}

export type UpdateProxyDto = Partial<CreateProxyDto>;

export function getProxies() {
  return request<ProxyWithCount[]>("/proxy", {
    method: "GET",
  });
}

export function getProxy(id: string) {
  return request<ProxyWithCount>(`/proxy/${id}`, {
    method: "GET",
  });
}

export function createProxy(data: CreateProxyDto) {
  return request<ProxyWithCount>("/proxy", {
    method: "POST",
    data,
  });
}

export function updateProxy(id: string, data: UpdateProxyDto) {
  return request<ProxyWithCount>(`/proxy/${id}`, {
    method: "PUT",
    data,
  });
}

export function deleteProxy(id: string) {
  return request<void>(`/proxy/${id}`, {
    method: "DELETE",
  });
}
