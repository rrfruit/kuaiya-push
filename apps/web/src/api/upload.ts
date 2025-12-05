import request from "@/lib/request";
import { http } from "@/lib/request";
import { UploadFile, FileType } from "@/types";

export function getUploadFiles(type?: FileType) {
  return request<UploadFile[]>("/upload", {
    params: type ? { type } : undefined,
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
