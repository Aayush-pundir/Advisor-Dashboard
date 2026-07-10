-- AlterTable
ALTER TABLE "Partner" ADD COLUMN "acceptedAt" DATETIME;
ALTER TABLE "Partner" ADD COLUMN "demoRequestedAt" DATETIME;
ALTER TABLE "Partner" ADD COLUMN "designation" TEXT;
ALTER TABLE "Partner" ADD COLUMN "mouCountersignedAt" DATETIME;

-- CreateTable
CREATE TABLE "MarketingContact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerId" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "city" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MarketingContact_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MarketingContact_partnerId_idx" ON "MarketingContact"("partnerId");

