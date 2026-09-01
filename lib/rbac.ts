export const ROLES = {
  CUSTOMER: "CUSTOMER",
  BUSINESS_OWNER: "BUSINESS_OWNER",
  SERVICE_PROVIDER: "SERVICE_PROVIDER",
  STUDENT: "STUDENT",
  FARMER: "FARMER",
  RIDER: "RIDER",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type RoleType = keyof typeof ROLES;

export function hasRole(userRoles: string[] = [], role: string): boolean {
  if (userRoles.includes(ROLES.SUPER_ADMIN)) return true;
  return userRoles.includes(role);
}

export function isAdmin(userRoles: string[] = []): boolean {
  return (
    userRoles.includes(ROLES.ADMIN) || userRoles.includes(ROLES.SUPER_ADMIN)
  );
}

export function isBusinessOwner(userRoles: string[] = []): boolean {
  return (
    userRoles.includes(ROLES.BUSINESS_OWNER) ||
    userRoles.includes(ROLES.ADMIN) ||
    userRoles.includes(ROLES.SUPER_ADMIN)
  );
}
