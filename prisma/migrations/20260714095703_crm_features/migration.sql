-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "relatedToType" TEXT NOT NULL,
    "relatedToId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RecordActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "relatedToType" TEXT NOT NULL,
    "relatedToId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "notes" TEXT,
    "dueDate" DATETIME,
    "completedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "createdById" TEXT,
    "createdByName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    "lossReason" TEXT,
    "score" INTEGER NOT NULL DEFAULT 0,
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
INSERT INTO "new_Lead" ("assignedToId", "businessName", "closedAt", "contactName", "contactedAt", "createdAt", "dealValue", "demoAt", "email", "healthScore", "id", "lastActivityAt", "npsScore", "partnerId", "phone", "riskLevel", "source", "stage", "supportTicketCount") SELECT "assignedToId", "businessName", "closedAt", "contactName", "contactedAt", "createdAt", "dealValue", "demoAt", "email", "healthScore", "id", "lastActivityAt", "npsScore", "partnerId", "phone", "riskLevel", "source", "stage", "supportTicketCount" FROM "Lead";
DROP TABLE "Lead";
ALTER TABLE "new_Lead" RENAME TO "Lead";
CREATE INDEX "Lead_partnerId_idx" ON "Lead"("partnerId");
CREATE INDEX "Lead_stage_idx" ON "Lead"("stage");
CREATE INDEX "Lead_assignedToId_idx" ON "Lead"("assignedToId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Note_relatedToType_relatedToId_idx" ON "Note"("relatedToType", "relatedToId");

-- CreateIndex
CREATE INDEX "RecordActivity_relatedToType_relatedToId_idx" ON "RecordActivity"("relatedToType", "relatedToId");

