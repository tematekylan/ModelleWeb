import { Role } from "@prisma/client";

export function canAccessSeller(role: Role) {
  return role === "SELLER" || role === "ADMIN";
}

export function canAccessAdmin(role: Role) {
  return role === "ADMIN";
}

export function canUploadTemplate(role: Role) {
  return role === "SELLER" || role === "ADMIN";
}
