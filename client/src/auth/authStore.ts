import { useSyncExternalStore } from "react";
import type { AuthUser } from "./authApi";

type AuthSession = {
  accessToken: string;
  user: AuthUser;
};

type AuthState = {
  session: AuthSession | null;
};

const STORAGE_KEY = "doc-patient-auth-session";

const listeners = new Set<() => void>();

function readInitialState(): AuthState {
  if (typeof localStorage === "undefined") {
    return { session: null };
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { session: null };
  }

  try {
    const parsed = JSON.parse(raw) as AuthState;
    return parsed.session ? parsed : { session: null };
  } catch {
    return { session: null };
  }
}

let state: AuthState = readInitialState();

function persist(next: AuthState): void {
  state = next;

  if (typeof localStorage !== "undefined") {
    if (next.session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  listeners.forEach((listener) => listener());
}

export const authStore = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): AuthState {
    return state;
  },
  setSession(session: AuthSession): void {
    persist({ session });
  },
  clearSession(): void {
    persist({ session: null });
  },
  resetForTests(): void {
    persist({ session: null });
  }
};

export function useAuthState(): AuthState {
  return useSyncExternalStore(authStore.subscribe, authStore.getSnapshot);
}
