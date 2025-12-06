import React, { useState } from "react";
import useDialogState from "@/hooks/use-dialog-state";
import { ProxyWithCount } from "@/api/proxy";

type ProxiesDialogType = "create" | "update" | "delete";

type ProxiesContextType = {
  open: ProxiesDialogType | null;
  setOpen: (str: ProxiesDialogType | null) => void;
  currentRow: ProxyWithCount | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<ProxyWithCount | null>>;
};

const ProxiesContext = React.createContext<ProxiesContextType | null>(null);

export function ProxiesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<ProxiesDialogType>(null);
  const [currentRow, setCurrentRow] = useState<ProxyWithCount | null>(null);

  return (
    <ProxiesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </ProxiesContext>
  );
}

export const useProxies = () => {
  const proxiesContext = React.useContext(ProxiesContext);

  if (!proxiesContext) {
    throw new Error("useProxies has to be used within <ProxiesProvider>");
  }

  return proxiesContext;
};
