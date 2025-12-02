import { create } from "zustand";
import { profile } from "@/api/auth";

type User = {
  name: string;
  email: string;
  avatar: string;
};

export const useUserStore = create<Partial<User & { token: string }>>(() => ({
  token: localStorage.getItem("token") || "",
}));

export const setToken = (token: string) => {
  useUserStore.setState(() => ({ token }));
  localStorage.setItem("token", token);
};

export const clearToken = () => {
  useUserStore.setState(() => ({ token: "" }));
  localStorage.removeItem("token");
};

export const setUserInfo = (info: Partial<User>) => {
  useUserStore.setState(() => ({
    ...info,
  }));
};

export const getUserInfo = async () => {
  const res = await profile();
  if (res.code === 0) {
    setUserInfo(res.data);
  } else {
    clearToken();
  }
};
