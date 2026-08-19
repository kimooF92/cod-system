"use client";

import * as React from "react";

export type QuickCreateType = "order" | "product" | "creative" | "research" | null;

interface QuickCreateContextValue {
  open: QuickCreateType;
  openCreate: (type: QuickCreateType) => void;
  closeCreate: () => void;
}

const QuickCreateContext = React.createContext<QuickCreateContextValue>({
  open: null,
  openCreate: () => {},
  closeCreate: () => {},
});

export function QuickCreateProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState<QuickCreateType>(null);

  const openCreate = React.useCallback((type: QuickCreateType) => setOpen(type), []);
  const closeCreate = React.useCallback(() => setOpen(null), []);

  return (
    <QuickCreateContext.Provider value={{ open, openCreate, closeCreate }}>
      {children}
    </QuickCreateContext.Provider>
  );
}

export function useQuickCreate() {
  return React.useContext(QuickCreateContext);
}
