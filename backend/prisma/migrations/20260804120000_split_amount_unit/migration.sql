-- Splittet den kombinierten `amount`-String ("125g") in `amount` (Float) und `unit` (String).
-- SQLite kann Spalten nicht direkt umtypisieren, deshalb der Umweg über eine neue Tabelle.
--
-- Aufteilung der Altdaten:
--   LTRIM(amount, '0123456789., ') schneidet den Zahlenteil vorne weg -> übrig bleibt die Einheit.
--   Über die Längendifferenz bekommt man im Gegenzug den Zahlenteil.
--   Das Komma wird zum Punkt, damit CAST(... AS REAL) auch "1,5" versteht.
-- Werte ohne Einheit ("233") landen als amount=233, unit=''.

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Ingredient" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "homeId" INTEGER NOT NULL,
    "mealId" INTEGER NOT NULL,
    CONSTRAINT "Ingredient_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ingredient_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Ingredient" ("id", "name", "amount", "unit", "homeId", "mealId")
SELECT
    "id",
    "name",
    CAST(REPLACE(SUBSTR("amount", 1, LENGTH("amount") - LENGTH(LTRIM("amount", '0123456789., '))), ',', '.') AS REAL),
    TRIM(LTRIM("amount", '0123456789., ')),
    "homeId",
    "mealId"
FROM "Ingredient";
DROP TABLE "Ingredient";
ALTER TABLE "new_Ingredient" RENAME TO "Ingredient";

CREATE TABLE "new_ListEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "homeId" INTEGER NOT NULL,
    "list" TEXT NOT NULL,
    CONSTRAINT "ListEntry_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ListEntry" ("id", "name", "amount", "unit", "homeId", "list")
SELECT
    "id",
    "name",
    CAST(REPLACE(SUBSTR("amount", 1, LENGTH("amount") - LENGTH(LTRIM("amount", '0123456789., '))), ',', '.') AS REAL),
    TRIM(LTRIM("amount", '0123456789., ')),
    "homeId",
    "list"
FROM "ListEntry";
DROP TABLE "ListEntry";
ALTER TABLE "new_ListEntry" RENAME TO "ListEntry";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
