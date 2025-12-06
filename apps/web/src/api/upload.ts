import request from "@/lib/request";
import { http } from "@/lib/request";
import type { UploadFile } from "@/types";

export function getUploadFiles() {
  return request<UploadFile[]>("/upload", {
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
