/*
  Warnings:

  - You are about to drop the column `activite` on the `Contact` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Contact` DROP COLUMN `activite`,
    ADD COLUMN `activiteId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Contact` ADD CONSTRAINT `Contact_activiteId_fkey` FOREIGN KEY (`activiteId`) REFERENCES `Activite`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
