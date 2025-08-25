/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'ADMIN', 'SUPPLIER');

-- DropForeignKey
ALTER TABLE "public"."Transfer" DROP CONSTRAINT "Transfer_fromUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Transfer" DROP CONSTRAINT "Transfer_toUserId_fkey";

-- AlterTable
ALTER TABLE "public"."Supplier" ADD COLUMN     "bankAccEnc" TEXT,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "taxIdEnc" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "resetTokenEnc" TEXT,
ADD COLUMN     "resetTokenExp" TIMESTAMP(3),
ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "public"."ResetToken" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tokenEnc" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_email_key" ON "public"."Supplier"("email");

-- AddForeignKey
ALTER TABLE "public"."Transfer" ADD CONSTRAINT "Transfer_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transfer" ADD CONSTRAINT "Transfer_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ResetToken" ADD CONSTRAINT "ResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
