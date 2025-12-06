import React, { useState } from "react";
import useDialogState from "@/hooks/use-dialog-state";
import { Work } from "@/types";

type WorksDialogType = "create" | "update" | "delete";

type WorksContextType = {
  open: WorksDialogType | null;
  setOpen: (str: WorksDialogType | null) => void;
  currentRow: Work | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<Work | null>>;
};

const WorksContext = React.createContext<WorksContextType | null>(null);

export function WorksProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<WorksDialogType>(null);
  const [currentRow, setCurrentRow] = useState<Work | null>(null);

  return (
    <WorksContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </WorksContext>
  );
}

export const useWorks = () => {
  const worksContext = React.useContext(WorksContext);

  if (!worksContext) {
    throw new Error("useWorks has to be used within <WorksProvider>");
  }

  return worksContext;
};
