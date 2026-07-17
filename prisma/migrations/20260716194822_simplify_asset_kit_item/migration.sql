-- Simplify AssetKitItem to {title, note, file, owner} — drop the fixed-catalogue
-- key, the status lifecycle (PENDING/IN_PROGRESS/DELIVERED) and dueAt/deliveredAt.
-- Existing rows are placeholder/catalogue rows with no real file, so they are
-- dropped; asset items are re-created by admin upload (and by seed in dev).
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
DROP TABLE "AssetKitItem";
CREATE TABLE "AssetKitItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "sharedGroupId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AssetKitItem_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
