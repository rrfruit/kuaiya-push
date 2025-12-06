import React, { useState } from "react";
import useDialogState from "@/hooks/use-dialog-state";
import { AccountWithRelations } from "@/types";

type AccountsDialogType = "create" | "update" | "delete";

type AccountsContextType = {
  open: AccountsDialogType | null;
  setOpen: (str: AccountsDialogType | null) => void;
  currentRow: AccountWithRelations | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<AccountWithRelations | null>>;
};

const AccountsContext = React.createContext<AccountsContextType | null>(null);

export function AccountsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<AccountsDialogType>(null);
  const [currentRow, setCurrentRow] = useState<AccountWithRelations | null>(null);

  return (
    <AccountsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </AccountsContext>
  );
}

export const useAccounts = () => {
  const accountsContext = React.useContext(AccountsContext);

  if (!accountsContext) {
    throw new Error("useAccounts has to be used within <AccountsProvider>");
  }

  return accountsContext;
};
