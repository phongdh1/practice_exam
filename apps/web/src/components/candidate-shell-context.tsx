"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

interface CandidateShellState {
  accountAction?: ReactNode;
  hideBottomNav: boolean;
}

interface CandidateShellContextValue {
  state: CandidateShellState;
  setState: Dispatch<SetStateAction<CandidateShellState>>;
}

const defaultState: CandidateShellState = { hideBottomNav: false };

const CandidateShellContext = createContext<CandidateShellContextValue | null>(null);

export function CandidateShellProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CandidateShellState>(defaultState);
  const value = useMemo(() => ({ state, setState }), [state]);

  return (
    <CandidateShellContext.Provider value={value}>{children}</CandidateShellContext.Provider>
  );
}

export function useCandidateShellState() {
  const ctx = useContext(CandidateShellContext);
  if (!ctx) {
    throw new Error("useCandidateShellState must be used within CandidateShellProvider");
  }
  return ctx.state;
}

export function useCandidateShell(options: Partial<CandidateShellState>) {
  const setState = useContext(CandidateShellContext)?.setState;
  const { accountAction, hideBottomNav } = options;

  useEffect(() => {
    if (!setState) return;

    setState((prev) => {
      const next: CandidateShellState = {
        ...prev,
        ...(accountAction !== undefined ? { accountAction } : {}),
        ...(hideBottomNav !== undefined ? { hideBottomNav } : {}),
      };
      if (next.accountAction === prev.accountAction && next.hideBottomNav === prev.hideBottomNav) {
        return prev;
      }
      return next;
    });

    return () => {
      setState((prev) => {
        const next: CandidateShellState = {
          ...prev,
          ...(accountAction !== undefined ? { accountAction: undefined } : {}),
          ...(hideBottomNav !== undefined ? { hideBottomNav: false } : {}),
        };
        if (next.accountAction === prev.accountAction && next.hideBottomNav === prev.hideBottomNav) {
          return prev;
        }
        return next;
      });
    };
  }, [setState, accountAction, hideBottomNav]);
}
