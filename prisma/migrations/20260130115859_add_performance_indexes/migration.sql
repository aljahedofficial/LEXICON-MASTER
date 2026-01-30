-- Add performance indexes for frequently queried columns

-- Projects table
CREATE INDEX IF NOT EXISTS "projects_userId_status_idx" ON "projects"("userId", "status");
CREATE INDEX IF NOT EXISTS "projects_createdAt_idx" ON "projects"("createdAt" DESC);

-- Words table
CREATE INDEX IF NOT EXISTS "words_projectId_frequency_idx" ON "words"("projectId", "frequency" DESC);
CREATE INDEX IF NOT EXISTS "words_word_idx" ON "words"("word");
CREATE INDEX IF NOT EXISTS "words_language_idx" ON "words"("language");
CREATE INDEX IF NOT EXISTS "words_enrichmentStatus_idx" ON "words"("enrichmentStatus");

-- ProjectFiles table
CREATE INDEX IF NOT EXISTS "project_files_processingStatus_idx" ON "project_files"("processingStatus");
CREATE INDEX IF NOT EXISTS "project_files_uploadStatus_idx" ON "project_files"("uploadStatus");

-- Flashcards table (already has some indexes)
CREATE INDEX IF NOT EXISTS "flashcards_status_idx" ON "flashcards"("status");
CREATE INDEX IF NOT EXISTS "flashcards_userId_status_idx" ON "flashcards"("userId", "status");

-- Exports table
CREATE INDEX IF NOT EXISTS "exports_userId_createdAt_idx" ON "exports"("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "exports_status_idx" ON "exports"("status");

-- QuizAttempts table
CREATE INDEX IF NOT EXISTS "quiz_attempts_userId_attemptedAt_idx" ON "quiz_attempts"("userId", "attemptedAt" DESC);

-- LearningProgress table (already has unique on userId)
CREATE INDEX IF NOT EXISTS "learning_progress_lastStudyDate_idx" ON "learning_progress"("lastStudyDate");
