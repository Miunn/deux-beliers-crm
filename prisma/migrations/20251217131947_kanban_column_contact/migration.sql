/*
  Warnings:

  - You are about to drop the `KanbanColumns` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `Contact` ADD COLUMN `kanbanColumnId` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `KanbanColumns`;

-- CreateTable
CREATE TABLE `KanbanColumn` (
    `id` VARCHAR(191) NOT NULL,
    `name` TEXT NOT NULL,
    `color` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Contact` ADD CONSTRAINT `Contact_kanbanColumnId_fkey` FOREIGN KEY (`kanbanColumnId`) REFERENCES `KanbanColumn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
