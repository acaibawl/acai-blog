-- CreateTable
CREATE TABLE "ConnectionTest" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "ConnectionTest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConnectionTest_email_key" ON "ConnectionTest"("email");
