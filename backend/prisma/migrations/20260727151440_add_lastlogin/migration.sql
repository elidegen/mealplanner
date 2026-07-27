/*
  Warnings:

  - Added the required column `lastLogin` to the `HomeMembership` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HomeMembership" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "homeId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "lastLogin" DATETIME NOT NULL,
    CONSTRAINT "HomeMembership_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HomeMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_HomeMembership" ("homeId", "id", "role", "userId") SELECT "homeId", "id", "role", "userId" FROM "HomeMembership";
DROP TABLE "HomeMembership";
ALTER TABLE "new_HomeMembership" RENAME TO "HomeMembership";
CREATE TABLE "new_Meal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "macroId" INTEGER,
    "portions" INTEGER NOT NULL,
    "instructions" TEXT,
    "homeId" INTEGER,
    "public" BOOLEAN NOT NULL,
    CONSTRAINT "Meal_macroId_fkey" FOREIGN KEY ("macroId") REFERENCES "Macros" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Meal_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Meal" ("homeId", "id", "instructions", "macroId", "name", "portions", "public") SELECT "homeId", "id", "instructions", "macroId", "name", "portions", "public" FROM "Meal";
DROP TABLE "Meal";
ALTER TABLE "new_Meal" RENAME TO "Meal";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
