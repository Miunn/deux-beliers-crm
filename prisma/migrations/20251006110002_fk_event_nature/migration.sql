/*
  Warnings:

  - You are about to drop the column `nature` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Event` DROP COLUMN `nature`,
    ADD COLUMN `natureId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_natureId_fkey` FOREIGN KEY (`natureId`) REFERENCES `Nature`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
