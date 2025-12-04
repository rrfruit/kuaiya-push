/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `credential` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Proxy` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Work` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Work` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `WorkPublishRecord` table. All the data in the column will be lost.
  - Made the column `description` on table `Work` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "User_username_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platformId" TEXT NOT NULL,
    "proxyId" TEXT,
    "displayName" TEXT NOT NULL,
    "coverUrl" TEXT,
    "platformUserId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NOT_LOGGED_IN',
    "lastSyncedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Account_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Account_proxyId_fkey" FOREIGN KEY ("proxyId") REFERENCES "Proxy" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Account" ("coverUrl", "createdAt", "displayName", "id", "lastSyncedAt", "platformId", "platformUserId", "proxyId", "status", "updatedAt") SELECT "coverUrl", "createdAt", "displayName", "id", "lastSyncedAt", "platformId", "platformUserId", "proxyId", "status", "updatedAt" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_platformId_platformUserId_key" ON "Account"("platformId", "platformUserId");
CREATE TABLE "new_Proxy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "type" TEXT NOT NULL DEFAULT 'HTTP',
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "username" TEXT,
    "password" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "location" TEXT,
    "lastUsedAt" DATETIME,
    "expireAt" DATETIME,
    "remark" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Proxy" ("createdAt", "expireAt", "host", "id", "lastUsedAt", "location", "name", "password", "port", "remark", "status", "type", "updatedAt", "username") SELECT "createdAt", "expireAt", "host", "id", "lastUsedAt", "location", "name", "password", "port", "remark", "status", "type", "updatedAt", "username" FROM "Proxy";
DROP TABLE "Proxy";
ALTER TABLE "new_Proxy" RENAME TO "Proxy";
CREATE TABLE "new_Work" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'TEXT',
    "description" TEXT NOT NULL,
    "mediaUrl" TEXT NOT NULL,
    "coverUrl" TEXT,
    "content" TEXT,
    "imgs" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Work" ("coverUrl", "createdAt", "description", "id", "mediaUrl", "status", "title", "updatedAt") SELECT "coverUrl", "createdAt", "description", "id", "mediaUrl", "status", "title", "updatedAt" FROM "Work";
DROP TABLE "Work";
ALTER TABLE "new_Work" RENAME TO "Work";
CREATE TABLE "new_WorkPublishRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "scheduledAt" DATETIME,
    "startedAt" DATETIME,
    "publishedAt" DATETIME,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "responseData" JSONB,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkPublishRecord_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorkPublishRecord_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorkPublishRecord_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WorkPublishRecord" ("accountId", "createdAt", "errorMessage", "id", "platformId", "publishedAt", "responseData", "retryCount", "scheduledAt", "startedAt", "status", "updatedAt", "workId") SELECT "accountId", "createdAt", "errorMessage", "id", "platformId", "publishedAt", "responseData", "retryCount", "scheduledAt", "startedAt", "status", "updatedAt", "workId" FROM "WorkPublishRecord";
DROP TABLE "WorkPublishRecord";
ALTER TABLE "new_WorkPublishRecord" RENAME TO "WorkPublishRecord";
CREATE INDEX "WorkPublishRecord_platformId_idx" ON "WorkPublishRecord"("platformId");
CREATE INDEX "WorkPublishRecord_status_idx" ON "WorkPublishRecord"("status");
CREATE UNIQUE INDEX "WorkPublishRecord_workId_accountId_key" ON "WorkPublishRecord"("workId", "accountId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
