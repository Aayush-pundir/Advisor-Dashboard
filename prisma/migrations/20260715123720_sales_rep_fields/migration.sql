-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "partnerId" TEXT,
    "firmRole" TEXT NOT NULL DEFAULT 'OWNER',
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "passwordChangedAt" DATETIME,
    "sessionVersion" INTEGER NOT NULL DEFAULT 1,
    "lastLoginAt" DATETIME,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "isSalesRep" BOOLEAN NOT NULL DEFAULT false,
    "assignmentPriority" INTEGER NOT NULL DEFAULT 0,
    "twoFactorSecret" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("active", "createdAt", "email", "firmRole", "id", "lastLoginAt", "mustChangePassword", "name", "partnerId", "passwordChangedAt", "passwordHash", "role", "sessionVersion", "twoFactorEnabled", "twoFactorSecret") SELECT "active", "createdAt", "email", "firmRole", "id", "lastLoginAt", "mustChangePassword", "name", "partnerId", "passwordChangedAt", "passwordHash", "role", "sessionVersion", "twoFactorEnabled", "twoFactorSecret" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_partnerId_idx" ON "User"("partnerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

