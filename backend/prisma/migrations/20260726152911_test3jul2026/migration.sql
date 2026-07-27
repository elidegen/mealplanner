/*
  Warnings:

  - A unique constraint covering the columns `[name,homeId]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_homeId_key" ON "Tag"("name", "homeId");
