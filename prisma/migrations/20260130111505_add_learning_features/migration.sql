-- CreateTable
CREATE TABLE "spaced_repetition_reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "flashcardId" TEXT NOT NULL,
    "wasCorrect" BOOLEAN NOT NULL,
    "reviewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextReviewAt" DATETIME NOT NULL,
    "qualityScore" INTEGER NOT NULL,
    CONSTRAINT "spaced_repetition_reviews_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES "flashcards" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "learning_progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "totalCardsCreated" INTEGER NOT NULL DEFAULT 0,
    "cardsMastered" INTEGER NOT NULL DEFAULT 0,
    "cardsInProgress" INTEGER NOT NULL DEFAULT 0,
    "cardsNotStarted" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastStudyDate" DATETIME,
    "dailyGoal" INTEGER NOT NULL DEFAULT 20,
    "todayStudied" INTEGER NOT NULL DEFAULT 0,
    "totalStudyTime" INTEGER NOT NULL DEFAULT 0,
    "totalQuizzesAttempted" INTEGER NOT NULL DEFAULT 0,
    "totalQuizzesCorrect" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "learning_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "progressId" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "achievements_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "learning_progress" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_flashcards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "frontContent" TEXT NOT NULL,
    "backContent" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "masteryLevel" INTEGER NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "lastReviewedAt" DATETIME,
    "nextReviewAt" DATETIME,
    "difficultyFactor" REAL NOT NULL DEFAULT 2.5,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "flashcards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "flashcards_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "words" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_flashcards" ("backContent", "createdAt", "frontContent", "id", "status", "updatedAt", "userId", "wordId") SELECT "backContent", "createdAt", "frontContent", "id", "status", "updatedAt", "userId", "wordId" FROM "flashcards";
DROP TABLE "flashcards";
ALTER TABLE "new_flashcards" RENAME TO "flashcards";
CREATE INDEX "flashcards_userId_idx" ON "flashcards"("userId");
CREATE INDEX "flashcards_nextReviewAt_idx" ON "flashcards"("nextReviewAt");
CREATE UNIQUE INDEX "flashcards_userId_wordId_key" ON "flashcards"("userId", "wordId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "spaced_repetition_reviews_flashcardId_idx" ON "spaced_repetition_reviews"("flashcardId");

-- CreateIndex
CREATE UNIQUE INDEX "learning_progress_userId_key" ON "learning_progress"("userId");

-- CreateIndex
CREATE INDEX "achievements_progressId_idx" ON "achievements"("progressId");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_progressId_badge_key" ON "achievements"("progressId", "badge");
