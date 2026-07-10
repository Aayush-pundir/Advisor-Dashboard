-- CreateTable
CREATE TABLE "DealRegistration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "city" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DealRegistration_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MdfRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "requestedAmount" INTEGER NOT NULL,
    "approvedAmount" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MdfRequest_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "partnerId" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "escalationLevel" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SupportTicket_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CertificationProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerId" TEXT NOT NULL,
    "moduleKey" TEXT NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CertificationProgress_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
INSERT INTO "new_Lead" ("businessName", "closedAt", "contactName", "contactedAt", "createdAt", "dealValue", "demoAt", "email", "id", "partnerId", "phone", "source", "stage") SELECT "businessName", "closedAt", "contactName", "contactedAt", "createdAt", "dealValue", "demoAt", "email", "id", "partnerId", "phone", "source", "stage" FROM "Lead";
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
    "stage" TEXT NOT NULL DEFAULT 'LEAD',
    "certifiedAt" DATETIME,
    "demoScheduledAt" DATETIME,
    "demoAttendedAt" DATETIME,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Partner_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "Partner" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Partner" ("badgeTier", "bankAccountName", "bankAccountNumber", "bankIfsc", "certifiedAt", "city", "contactName", "createdAt", "demoAttendedAt", "demoScheduledAt", "email", "firmName", "gstNumber", "icaiNumber", "icaiVerified", "icpAdvisory", "icpClients", "icpDigital", "icpGeo", "icpMindset", "icpSize", "icpTech", "id", "mouVersion", "msaSignedAt", "pan", "phone", "referralCode", "referredById", "slug", "stage", "state", "updatedAt", "upiId") SELECT "badgeTier", "bankAccountName", "bankAccountNumber", "bankIfsc", "certifiedAt", "city", "contactName", "createdAt", "demoAttendedAt", "demoScheduledAt", "email", "firmName", "gstNumber", "icaiNumber", "icaiVerified", "icpAdvisory", "icpClients", "icpDigital", "icpGeo", "icpMindset", "icpSize", "icpTech", "id", "mouVersion", "msaSignedAt", "pan", "phone", "referralCode", "referredById", "slug", "stage", "state", "updatedAt", "upiId" FROM "Partner";
DROP TABLE "Partner";
ALTER TABLE "new_Partner" RENAME TO "Partner";
CREATE UNIQUE INDEX "Partner_slug_key" ON "Partner"("slug");
CREATE UNIQUE INDEX "Partner_email_key" ON "Partner"("email");
CREATE UNIQUE INDEX "Partner_referralCode_key" ON "Partner"("referralCode");
CREATE INDEX "Partner_stage_idx" ON "Partner"("stage");
CREATE INDEX "Partner_city_idx" ON "Partner"("city");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "DealRegistration_partnerId_idx" ON "DealRegistration"("partnerId");

-- CreateIndex
CREATE INDEX "DealRegistration_status_idx" ON "DealRegistration"("status");

-- CreateIndex
CREATE INDEX "MdfRequest_partnerId_idx" ON "MdfRequest"("partnerId");

-- CreateIndex
CREATE INDEX "MdfRequest_status_idx" ON "MdfRequest"("status");

-- CreateIndex
CREATE INDEX "SupportTicket_userId_idx" ON "SupportTicket"("userId");

-- CreateIndex
CREATE INDEX "SupportTicket_partnerId_idx" ON "SupportTicket"("partnerId");

-- CreateIndex
CREATE INDEX "SupportTicket_status_idx" ON "SupportTicket"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CertificationProgress_partnerId_moduleKey_key" ON "CertificationProgress"("partnerId", "moduleKey");
