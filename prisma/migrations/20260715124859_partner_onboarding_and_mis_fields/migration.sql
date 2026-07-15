-- AlterTable
ALTER TABLE "AssetKitItem" ADD COLUMN "customLabel" TEXT;

-- AlterTable
ALTER TABLE "Commission" ADD COLUMN "paidAt" DATETIME;

-- AlterTable
ALTER TABLE "SupportTicket" ADD COLUMN "resolution" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFTED',
    "scheduledAt" DATETIME,
    "approvedAt" DATETIME,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestedByPartner" BOOLEAN NOT NULL DEFAULT false,
    "requestNote" TEXT,
    "contentApprovedAt" DATETIME,
    "liveAt" DATETIME,
    CONSTRAINT "Campaign_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Campaign" ("approvedAt", "createdAt", "id", "partnerId", "scheduledAt", "sentAt", "status", "title", "type") SELECT "approvedAt", "createdAt", "id", "partnerId", "scheduledAt", "sentAt", "status", "title", "type" FROM "Campaign";
DROP TABLE "Campaign";
ALTER TABLE "new_Campaign" RENAME TO "Campaign";
CREATE INDEX "Campaign_partnerId_idx" ON "Campaign"("partnerId");
CREATE TABLE "new_Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'CAPTURED',
    "dealValue" INTEGER NOT NULL DEFAULT 0,
    "contactedAt" DATETIME,
    "demoAt" DATETIME,
    "closedAt" DATETIME,
    "lossReason" TEXT,
    "score" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT,
    "billingCycle" TEXT NOT NULL DEFAULT 'ANNUAL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedToId" TEXT,
    "healthScore" INTEGER,
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "npsScore" INTEGER,
    "supportTicketCount" INTEGER NOT NULL DEFAULT 0,
    "lastActivityAt" DATETIME,
    CONSTRAINT "Lead_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Lead_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Lead" ("assignedToId", "businessName", "closedAt", "contactName", "contactedAt", "createdAt", "dealValue", "demoAt", "email", "healthScore", "id", "lastActivityAt", "lossReason", "npsScore", "partnerId", "phone", "riskLevel", "score", "source", "stage", "supportTicketCount") SELECT "assignedToId", "businessName", "closedAt", "contactName", "contactedAt", "createdAt", "dealValue", "demoAt", "email", "healthScore", "id", "lastActivityAt", "lossReason", "npsScore", "partnerId", "phone", "riskLevel", "score", "source", "stage", "supportTicketCount" FROM "Lead";
DROP TABLE "Lead";
ALTER TABLE "new_Lead" RENAME TO "Lead";
CREATE INDEX "Lead_partnerId_idx" ON "Lead"("partnerId");
CREATE INDEX "Lead_stage_idx" ON "Lead"("stage");
CREATE INDEX "Lead_assignedToId_idx" ON "Lead"("assignedToId");
CREATE TABLE "new_Partner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "firmName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "icaiNumber" TEXT,
    "icaiVerified" BOOLEAN NOT NULL DEFAULT false,
    "msaSignedAt" DATETIME,
    "designation" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'LEAD',
    "acceptedAt" DATETIME,
    "acceptedComment" TEXT,
    "mouCountersignedAt" DATETIME,
    "mouCountersignedComment" TEXT,
    "demoRequestedAt" DATETIME,
    "certifiedAt" DATETIME,
    "demoScheduledAt" DATETIME,
    "demoScheduledComment" TEXT,
    "demoAttendedAt" DATETIME,
    "demoAttendedComment" TEXT,
    "assetKitDeliveredAt" DATETIME,
    "assetKitDeliveredComment" TEXT,
    "micrositeEnabled" BOOLEAN NOT NULL DEFAULT true,
    "icpClients" INTEGER NOT NULL DEFAULT 0,
    "icpAdvisory" INTEGER NOT NULL DEFAULT 0,
    "icpTech" INTEGER NOT NULL DEFAULT 0,
    "icpSize" INTEGER NOT NULL DEFAULT 0,
    "icpGeo" INTEGER NOT NULL DEFAULT 0,
    "icpDigital" INTEGER NOT NULL DEFAULT 0,
    "icpMindset" INTEGER NOT NULL DEFAULT 0,
    "badgeTier" TEXT NOT NULL DEFAULT 'NONE',
    "tierUpdatedAt" DATETIME,
    "certLevel" TEXT NOT NULL DEFAULT 'NONE',
    "referralCode" TEXT NOT NULL,
    "mouVersion" TEXT NOT NULL DEFAULT 'v1',
    "bankAccountName" TEXT,
    "bankAccountNumber" TEXT,
    "bankIfsc" TEXT,
    "upiId" TEXT,
    "pan" TEXT,
    "gstNumber" TEXT,
    "referredById" TEXT,
    "apiKey" TEXT,
    "webhookUrl" TEXT,
    "webhookSecret" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Partner_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "Partner" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Partner" ("acceptedAt", "apiKey", "badgeTier", "bankAccountName", "bankAccountNumber", "bankIfsc", "certLevel", "certifiedAt", "city", "contactName", "createdAt", "demoAttendedAt", "demoRequestedAt", "demoScheduledAt", "designation", "email", "firmName", "gstNumber", "icaiNumber", "icaiVerified", "icpAdvisory", "icpClients", "icpDigital", "icpGeo", "icpMindset", "icpSize", "icpTech", "id", "mouCountersignedAt", "mouVersion", "msaSignedAt", "pan", "phone", "referralCode", "referredById", "slug", "stage", "state", "tierUpdatedAt", "updatedAt", "upiId", "webhookSecret", "webhookUrl") SELECT "acceptedAt", "apiKey", "badgeTier", "bankAccountName", "bankAccountNumber", "bankIfsc", "certLevel", "certifiedAt", "city", "contactName", "createdAt", "demoAttendedAt", "demoRequestedAt", "demoScheduledAt", "designation", "email", "firmName", "gstNumber", "icaiNumber", "icaiVerified", "icpAdvisory", "icpClients", "icpDigital", "icpGeo", "icpMindset", "icpSize", "icpTech", "id", "mouCountersignedAt", "mouVersion", "msaSignedAt", "pan", "phone", "referralCode", "referredById", "slug", "stage", "state", "tierUpdatedAt", "updatedAt", "upiId", "webhookSecret", "webhookUrl" FROM "Partner";
DROP TABLE "Partner";
ALTER TABLE "new_Partner" RENAME TO "Partner";
CREATE UNIQUE INDEX "Partner_slug_key" ON "Partner"("slug");
CREATE UNIQUE INDEX "Partner_email_key" ON "Partner"("email");
CREATE UNIQUE INDEX "Partner_referralCode_key" ON "Partner"("referralCode");
CREATE UNIQUE INDEX "Partner_apiKey_key" ON "Partner"("apiKey");
CREATE INDEX "Partner_stage_idx" ON "Partner"("stage");
CREATE INDEX "Partner_city_idx" ON "Partner"("city");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

