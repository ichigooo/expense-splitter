"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

const EditMemberContext = createContext<{
  editMemberId: string | null;
  requestEdit: (memberId: string) => void;
  clearEdit: () => void;
}>({
  editMemberId: null,
  requestEdit: () => {},
  clearEdit: () => {},
});

export function EditMemberProvider({ children }: { children: ReactNode }) {
  const [editMemberId, setEditMemberId] = useState<string | null>(null);

  const requestEdit = useCallback((memberId: string) => {
    setEditMemberId(memberId);
  }, []);

  const clearEdit = useCallback(() => {
    setEditMemberId(null);
  }, []);

  return (
    <EditMemberContext.Provider value={{ editMemberId, requestEdit, clearEdit }}>
      {children}
    </EditMemberContext.Provider>
  );
}

export function useEditMember() {
  return useContext(EditMemberContext);
}
