import request from "@/lib/request";
import { Work, WorkType } from "@/types";

export interface CreateWorkDto {
  type?: WorkType;
  title: string;
  description?: string;
  mediaUrl?: string;
  coverUrl?: string;
  content?: string;
  imgs?: string;
}

export type UpdateWorkDto = Partial<CreateWorkDto>;

export function getWorks() {
  return request<Work[]>("/work", {
    method: "GET",
  });
}

export function getWork(id: string) {
  return request<Work>(`/work/${id}`, {
    method: "GET",
  });
}

export function createWork(data: CreateWorkDto) {
  return request<Work>("/work", {
    method: "POST",
    data,
  });
}

export function updateWork(id: string, data: UpdateWorkDto) {
  return request<Work>(`/work/${id}`, {
    method: "PUT",
    data,
  });
}

export function deleteWork(id: string) {
  return request<void>(`/work/${id}`, {
    method: "DELETE",
  });
}

export function deleteWorks(ids: string[]) {
  return request<{ count: number }>("/work/batch-delete", {
    method: "POST",
    data: { ids },
  });
}
