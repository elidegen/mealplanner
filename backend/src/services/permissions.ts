import { prisma } from "../lib/prisma";

// Drei Stufen: admin (verwaltet Mitglieder), user (bearbeitet Inhalte), gast (liest nur)
export type Role = "admin" | "user" | "gast";
export const ROLES: Role[] = ["admin", "user", "gast"];

// Rolle des Users in einem Home; null = kein Mitglied
export async function getRole(
  userId: number,
  homeId: number,
): Promise<Role | null> {
  const membership = await prisma.homeMembership.findFirst({
    where: { userId, homeId },
  });
  return membership ? (membership.role as Role) : null;
}

// Lesen darf jedes Mitglied
export async function isMember(userId: number, homeId: number) {
  return (await getRole(userId, homeId)) !== null;
}

// Schreiben dürfen admin und user, aber nicht gast
export async function canEdit(userId: number, homeId: number) {
  const role = await getRole(userId, homeId);
  return role === "admin" || role === "user";
}

// Wie viele Admins hat das Home? Verhindert, dass der letzte Admin verschwindet
export async function countAdmins(homeId: number) {
  return prisma.homeMembership.count({ where: { homeId, role: "admin" } });
}
