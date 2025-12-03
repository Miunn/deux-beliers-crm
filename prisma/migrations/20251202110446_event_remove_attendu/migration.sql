/*
  Warnings:

  - You are about to drop the column `attendus` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `date_traitement` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `resultat` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Event` DROP COLUMN `attendus`,
    DROP COLUMN `date_traitement`,
    DROP COLUMN `resultat`,
    ADD COLUMN `commentaires` TEXT NULL;
