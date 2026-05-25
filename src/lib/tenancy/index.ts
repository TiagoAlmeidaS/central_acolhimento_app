/**
 * Barrel central da lib `tenancy/`.
 *
 * Outras specs importam daqui:
 *
 *   import { getCurrentTenant, requireRole } from "@/lib/tenancy";
 *
 * Os símbolos vêm do `current.ts`. Quando precisar quebrar em mais
 * arquivos (ex.: middleware Drizzle, helpers de RLS), reexporte aqui.
 */
export {
  getCurrentTenant,
  setActiveTenant,
  clearActiveTenant,
  listMyTenants,
  requireRole,
  TenantAccessError,
  ForbiddenRoleError,
  type TenantWithRole,
  type Papel,
} from "./current";
