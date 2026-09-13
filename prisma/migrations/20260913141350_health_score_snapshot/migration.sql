-- CreateTable
CREATE TABLE "HealthScoreSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "yearMonth" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthScoreSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HealthScoreSnapshot_userId_idx" ON "HealthScoreSnapshot"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HealthScoreSnapshot_userId_yearMonth_key" ON "HealthScoreSnapshot"("userId", "yearMonth");

-- AddForeignKey
ALTER TABLE "HealthScoreSnapshot" ADD CONSTRAINT "HealthScoreSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
