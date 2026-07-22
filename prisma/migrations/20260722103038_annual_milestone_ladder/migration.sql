-- Replace the quarterly Silver/Gold/Platinum tier system with a 7-step
-- annual milestone ladder (1st/3rd/5th/10th/15th/20th/25th client) plus a
-- permanent Elite Club status. Badge.quarter is replaced by Badge.period
-- (an anniversary-year label like "Y1", or "ELITE_30" for Elite Club
-- benefits) — old badge rows used a different tier vocabulary entirely
-- (SILVER/GOLD/PLATINUM vs CLIENT_1..CLIENT_25/ELITE_BENEFIT) so they are
-- dropped rather than migrated; the badge-awarding logic recomputes fresh
-- for the current anniversary year on next lead close.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

DROP TABLE "Badge";
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerId" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "clientsAtMilestone" INTEGER NOT NULL,
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "giftDispatchedAt" DATETIME,
    CONSTRAINT "Badge_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Badge_partnerId_period_tier_key" ON "Badge"("partnerId", "period", "tier");

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
    "logoUrl" TEXT,
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
    "eliteClubMember" BOOLEAN NOT NULL DEFAULT false,
    "eliteMemberSince" DATETIME,
    "eliteBenefitsIssued" INTEGER NOT NULL DEFAULT 0,
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
INSERT INTO "new_Partner" ("acceptedAt", "acceptedComment", "apiKey", "assetKitDeliveredAt", "assetKitDeliveredComment", "badgeTier", "bankAccountName", "bankAccountNumber", "bankIfsc", "certLevel", "certifiedAt", "city", "contactName", "createdAt", "demoAttendedAt", "demoAttendedComment", "demoRequestedAt", "demoScheduledAt", "demoScheduledComment", "designation", "email", "firmName", "gstNumber", "icaiNumber", "icaiVerified", "icpAdvisory", "icpClients", "icpDigital", "icpGeo", "icpMindset", "icpSize", "icpTech", "id", "logoUrl", "micrositeEnabled", "mouCountersignedAt", "mouCountersignedComment", "mouVersion", "msaSignedAt", "pan", "phone", "referralCode", "referredById", "slug", "stage", "state", "tierUpdatedAt", "updatedAt", "upiId", "webhookSecret", "webhookUrl")
SELECT "acceptedAt", "acceptedComment", "apiKey", "assetKitDeliveredAt", "assetKitDeliveredComment", "badgeTier", "bankAccountName", "bankAccountNumber", "bankIfsc", "certLevel", "certifiedAt", "city", "contactName", "createdAt", "demoAttendedAt", "demoAttendedComment", "demoRequestedAt", "demoScheduledAt", "demoScheduledComment", "designation", "email", "firmName", "gstNumber", "icaiNumber", "icaiVerified", "icpAdvisory", "icpClients", "icpDigital", "icpGeo", "icpMindset", "icpSize", "icpTech", "id", "logoUrl", "micrositeEnabled", "mouCountersignedAt", "mouCountersignedComment", "mouVersion", "msaSignedAt", "pan", "phone", "referralCode", "referredById", "slug", "stage", "state", "tierUpdatedAt", "updatedAt", "upiId", "webhookSecret", "webhookUrl" FROM "Partner";
DROP TABLE "Partner";
ALTER TABLE "new_Partner" RENAME TO "Partner";
CREATE UNIQUE INDEX "Partner_slug_key" ON "Partner"("slug");
CREATE UNIQUE INDEX "Partner_email_key" ON "Partner"("email");
CREATE UNIQUE INDEX "Partner_referralCode_key" ON "Partner"("referralCode");
CREATE UNIQUE INDEX "Partner_apiKey_key" ON "Partner"("apiKey");
CREATE INDEX "Partner_stage_idx" ON "Partner"("stage");
CREATE INDEX "Partner_city_idx" ON "Partner"("city");

-- Old badgeTier values (SILVER/GOLD/PLATINUM) don't exist in the new
-- vocabulary (CLIENT_1..CLIENT_25) — reset so the next lead close
-- recomputes fresh under the new system.
UPDATE "Partner" SET "badgeTier" = 'NONE', "tierUpdatedAt" = NULL;

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
