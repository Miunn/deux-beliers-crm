-- CreateTable
CREATE TABLE `backup` (
    `id` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `sizeBytes` INTEGER NOT NULL,
    `contacts` INTEGER NOT NULL,
    `activeContacts` INTEGER NOT NULL,
    `archivedContacts` INTEGER NOT NULL,
    `events` INTEGER NOT NULL,
    `labels` INTEGER NOT NULL,
    `natures` INTEGER NOT NULL,
    `activites` INTEGER NOT NULL,
    `kanbanColumns` INTEGER NOT NULL,
    `contactLabels` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
