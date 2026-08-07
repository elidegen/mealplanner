import { describe, it, expect, vi, beforeEach } from "vitest";

// Die Rechtelogik selbst kommt ohne Datenbank aus: getestet wird, was aus
// einer gefundenen (oder fehlenden) Mitgliedschaft folgt.
const findFirst = vi.fn();

vi.mock("../lib/prisma", () => ({
  prisma: { homeMembership: { findFirst } },
}));

const { getRole, isMember, canEdit } = await import("./permissions");

// Simuliert die Mitgliedschaft des Users im angefragten Home
function mitgliedschaft(role: string | null) {
  findFirst.mockResolvedValue(role ? { id: 1, role } : null);
}

beforeEach(() => findFirst.mockReset());

describe("getRole", () => {
  it("liefert null, wenn keine Mitgliedschaft existiert", async () => {
    mitgliedschaft(null);
    expect(await getRole(1, 1)).toBeNull();
  });
});

describe("isMember", () => {
  it("erlaubt jedem Mitglied das Lesen, auch dem Gast", async () => {
    mitgliedschaft("gast");
    expect(await isMember(1, 1)).toBe(true);
  });

  it("sperrt Nicht-Mitglieder aus", async () => {
    mitgliedschaft(null);
    expect(await isMember(1, 1)).toBe(false);
  });
});

describe("canEdit", () => {
  it("laesst Admin und User schreiben", async () => {
    mitgliedschaft("admin");
    expect(await canEdit(1, 1)).toBe(true);

    mitgliedschaft("user");
    expect(await canEdit(1, 1)).toBe(true);
  });

  it("laesst den Gast nur lesen", async () => {
    mitgliedschaft("gast");
    expect(await canEdit(1, 1)).toBe(false);
  });

  it("verweigert Nicht-Mitgliedern das Schreiben", async () => {
    // Der Fall, der die Homes voneinander trennt: Die homeId kommt aus der
    // Anfrage, also darf sie nie ohne diese Pruefung akzeptiert werden.
    mitgliedschaft(null);
    expect(await canEdit(1, 999)).toBe(false);
  });
});