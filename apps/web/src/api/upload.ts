import request from "@/lib/request";
import { http } from "@/lib/request";
import { UploadFile, FileType } from "@/types";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetUploadFilesParams {
  page?: number;
  pageSize?: number;
  type?: FileType;
}

export function getUploadFiles(params?: GetUploadFilesParams) {
  return request<PaginatedResult<UploadFile>>("/upload", {
    params: params ? {
      page: params.page,
      pageSize: params.pageSize,
      type: params.type,
    } : undefined,
    method: "GET",
  });
}

export function getUploadFile(id: string) {
  return request<UploadFile>(`/upload/${id}`, {
    method: "GET",
  });
}

export function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return http.post<{ code: number; message: string; data: UploadFile }>(
    "/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
}

export function deleteUploadFile(id: string) {
  return request<UploadFile>(`/upload/${id}`, {
    method: "DELETE",
  });
}
