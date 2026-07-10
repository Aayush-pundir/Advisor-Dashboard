-- AlterTable
ALTER TABLE "Partner" ADD COLUMN "apiKey" TEXT;
ALTER TABLE "Partner" ADD COLUMN "webhookSecret" TEXT;
ALTER TABLE "Partner" ADD COLUMN "webhookUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Partner_apiKey_key" ON "Partner"("apiKey");

