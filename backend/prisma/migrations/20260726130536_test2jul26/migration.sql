/*
  Warnings:

  - You are about to drop the `Macro` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Macro";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Macros" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "calories" INTEGER,
    "carbs" INTEGER,
    "proteins" INTEGER,
    "fat" INTEGER
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Meal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "macroId" INTEGER NOT NULL,
    "portions" INTEGER NOT NULL,
    "instructions" TEXT,
    "homeId" INTEGER,
    "public" BOOLEAN NOT NULL,
    CONSTRAINT "Meal_macroId_fkey" FOREIGN KEY ("macroId") REFERENCES "Macros" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Meal_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Meal" ("homeId", "id", "instructions", "macroId", "name", "portions", "public") SELECT "homeId", "id", "instructions", "macroId", "name", "portions", "public" FROM "Meal";
DROP TABLE "Meal";
ALTER TABLE "new_Meal" RENAME TO "Meal";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
