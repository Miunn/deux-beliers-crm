-- CreateTable
CREATE TABLE `KanbanColumns` (
    `id` VARCHAR(191) NOT NULL,
    `name` TEXT NOT NULL,
    `color` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
