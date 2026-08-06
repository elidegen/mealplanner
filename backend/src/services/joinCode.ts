import { prisma } from "../lib/prisma";

// Einladungscode: ohne I, O, 0 und 1, damit nichts verwechselt wird
export function generateJoinCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

// Homes aus der Zeit vor den Einladungscodes nachträglich mit einem Code versehen
export async function backfillJoinCodes() {
  const ohneCode = await prisma.home.findMany({ where: { password: "" } });
  for (const home of ohneCode) {
    await prisma.home.update({
      where: { id: home.id },
      data: { password: generateJoinCode() },
    });
  }
  if (ohneCode.length > 0) {
    console.log(
      `${ohneCode.length} Home(s) haben einen Einladungscode erhalten`,
    );
  }
}
