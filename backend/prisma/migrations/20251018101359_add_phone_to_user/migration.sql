/*
  Warnings:

  - You are about to drop the column `phone` on the `PatientInfo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PatientInfo" DROP COLUMN "phone";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" VARCHAR(12);
