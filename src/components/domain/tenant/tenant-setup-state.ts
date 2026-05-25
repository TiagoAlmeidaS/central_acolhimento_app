"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { TenantColor } from "@/db/schema";
import type { UF } from "@/lib/data/tenants";

/**
 * Estado client-side do fluxo de tenant-setup (5 passos + revisão).
 *
 * Persiste em `localStorage` chaveado por `userId` para que:
 *  - Refresh / fechamento do tab não perca progresso (req da spec).
 *  - Múltiplos usuários no mesmo browser não vejam dados um do outro
 *    (chave dinâmica `acolhe.tenant-setup.{userId}`).
 *
 * O DB só é tocado no passo 5 quando o checkout do Stripe completar
 * (via `provisionTenant`). Todos os passos anteriores são puramente
 * client-side — ninguém precisa estar conectado ao Postgres para
 * preencher um form.
 */

export interface TenantSetupLider {
  nome: string;
  telefone: string;
}

export interface TenantSetupLocalidade {
  nome: string;
  denominacao: string;
  cidade: string;
  uf: UF | "";
}

export interface TenantSetupPersonaliza {
  sigla: string;
  cor: TenantColor;
}

export interface TenantSetupState {
  lider: TenantSetupLider;
  localidade: TenantSetupLocalidade;
  personaliza: TenantSetupPersonaliza;
  /** Marca se o passo 2 (OTP) foi validado nesta sessão. */
  otpVerified: boolean;

  setLider: (patch: Partial<TenantSetupLider>) => void;
  setLocalidade: (patch: Partial<TenantSetupLocalidade>) => void;
  setPersonaliza: (patch: Partial<TenantSetupPersonaliza>) => void;
  setOtpVerified: (verified: boolean) => void;
  reset: () => void;
}

const DEFAULT_COLOR: TenantColor = "#2D7FF9";

const empty = (): Pick<
  TenantSetupState,
  "lider" | "localidade" | "personaliza" | "otpVerified"
> => ({
  lider: { nome: "", telefone: "" },
  localidade: { nome: "", denominacao: "", cidade: "", uf: "" },
  personaliza: { sigla: "", cor: DEFAULT_COLOR },
  otpVerified: false,
});

/**
 * Storage SSR-safe: durante o render no servidor não há `window`,
 * então devolvemos um stub no-op. O Zustand persist middleware
 * trata bem esse caso.
 */
const noopStorage: Storage = {
  length: 0,
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  key: () => null,
};

const safeStorage = createJSONStorage<TenantSetupState>(() =>
  typeof window !== "undefined" ? window.localStorage : noopStorage,
);

/**
 * Cria a store Zustand. Recebe o `userId` para isolar storages —
 * fundamental porque um mesmo browser pode logar com OTP em contas
 * diferentes (dispositivo emprestado, kiosk).
 *
 * Use `useTenantSetupStore(userId)` no topo do `<Provider>` do layout
 * de tenant-setup; os hooks individuais consomem do contexto.
 */
export function makeTenantSetupStore(userId: string) {
  const storageKey = `acolhe.tenant-setup.${userId || "anon"}`;
  return create<TenantSetupState>()(
    persist(
      (set) => ({
        ...empty(),
        setLider: (patch) =>
          set((s) => ({ lider: { ...s.lider, ...patch } })),
        setLocalidade: (patch) =>
          set((s) => ({ localidade: { ...s.localidade, ...patch } })),
        setPersonaliza: (patch) =>
          set((s) => ({ personaliza: { ...s.personaliza, ...patch } })),
        setOtpVerified: (verified) => set({ otpVerified: verified }),
        reset: () => set(empty()),
      }),
      {
        name: storageKey,
        storage: safeStorage,
        // OTP de uma sessão NÃO deve sobreviver ao refresh: zera no rehydrate.
        onRehydrateStorage: () => (state) => {
          if (state) state.otpVerified = false;
        },
      },
    ),
  );
}

export type TenantSetupStore = ReturnType<typeof makeTenantSetupStore>;

/**
 * Singleton anônimo — usado para playground/dev quando não há userId.
 * Em produção, prefira o store via Context (vide `tenant-setup-store-provider.tsx`).
 */
export const useAnonTenantSetupStore = makeTenantSetupStore("anon");
