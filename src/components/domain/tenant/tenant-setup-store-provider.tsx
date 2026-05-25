"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";
import { useStore } from "zustand";
import {
  makeTenantSetupStore,
  type TenantSetupState,
  type TenantSetupStore,
} from "./tenant-setup-state";

/**
 * Provider de Context que isola o `userId` na criação da store Zustand.
 *
 * Por que Context e não singleton global? Porque o mesmo navegador pode
 * trocar de conta (logout + login com outro telefone) sem hard reload
 * em alguns flows. Ao re-montar o `<TenantSetupStoreProvider>` com
 * `userId` diferente, criamos uma store nova com chave de storage
 * própria e os dados não vazam.
 *
 * O hook `useTenantSetupStore(selector)` segue o pattern oficial do
 * Zustand para evitar re-renders desnecessários.
 */

const TenantSetupStoreContext = createContext<TenantSetupStore | null>(null);

export interface TenantSetupStoreProviderProps {
  userId: string;
  children: ReactNode;
}

export function TenantSetupStoreProvider({
  userId,
  children,
}: TenantSetupStoreProviderProps) {
  const storeRef = useRef<TenantSetupStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeTenantSetupStore(userId);
  }
  return (
    <TenantSetupStoreContext.Provider value={storeRef.current}>
      {children}
    </TenantSetupStoreContext.Provider>
  );
}

/**
 * Hook tipado para ler o estado de tenant-setup. Aceita um seletor;
 * sem seletor devolve o estado inteiro (re-render em qualquer mudança —
 * preferir seletores).
 */
export function useTenantSetupStore<T>(
  selector: (state: TenantSetupState) => T,
): T;
export function useTenantSetupStore(): TenantSetupState;
export function useTenantSetupStore<T>(
  selector?: (state: TenantSetupState) => T,
): T | TenantSetupState {
  const store = useContext(TenantSetupStoreContext);
  if (!store) {
    throw new Error(
      "useTenantSetupStore precisa estar dentro de <TenantSetupStoreProvider>.",
    );
  }
  return useStore(store, selector ?? ((s) => s as unknown as T));
}
