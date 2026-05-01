-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "options" TEXT[],
    "correctIdx" INTEGER NOT NULL,
    "explanation" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'intermediate',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quiz_questions_module_idx" ON "quiz_questions"("module");

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'module',
    "score" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 10,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quiz_attempts_userId_idx" ON "quiz_attempts"("userId");

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "quiz_responses" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "chosenIdx" INTEGER NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quiz_responses_attemptId_idx" ON "quiz_responses"("attemptId");

-- AddForeignKey
ALTER TABLE "quiz_responses" ADD CONSTRAINT "quiz_responses_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_responses" ADD CONSTRAINT "quiz_responses_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "user_seen_questions" (
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "seenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_seen_questions_pkey" PRIMARY KEY ("userId","questionId")
);

-- CreateIndex
CREATE INDEX "user_seen_questions_userId_idx" ON "user_seen_questions"("userId");

-- AddForeignKey
ALTER TABLE "user_seen_questions" ADD CONSTRAINT "user_seen_questions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_seen_questions" ADD CONSTRAINT "user_seen_questions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
