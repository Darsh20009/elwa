import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface AuthModalState {
  open: boolean;
  onSuccess?: () => void;
  initialMode?: "guest" | "account";
}

interface AuthModalContextType {
  state: AuthModalState;
  openAuthModal: (opts?: { onSuccess?: () => void; initialMode?: "guest" | "account" }) => void;
  closeAuthModal: () => void;
  triggerSuccess: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthModalState>({ open: false, initialMode: "account" });

  const openAuthModal = useCallback((opts?: { onSuccess?: () => void; initialMode?: "guest" | "account" }) => {
    setState({ open: true, onSuccess: opts?.onSuccess, initialMode: opts?.initialMode || "account" });
  }, []);

  const closeAuthModal = useCallback(() => {
    setState((prev) => ({ open: false, onSuccess: prev.onSuccess, initialMode: prev.initialMode }));
  }, []);

  const triggerSuccess = useCallback(() => {
    setState((prev) => {
      prev.onSuccess?.();
      return { open: false };
    });
  }, []);

  return (
    <AuthModalContext.Provider value={{ state, openAuthModal, closeAuthModal, triggerSuccess }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}
