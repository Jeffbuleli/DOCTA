-- CreateTable
CREATE TABLE "AccountPatientLink" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountPatientLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkCode" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareGrant" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareAccess" (
    "id" TEXT NOT NULL,
    "grantId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccountPatientLink_accountId_idx" ON "AccountPatientLink"("accountId");

-- CreateIndex
CREATE INDEX "AccountPatientLink_patientId_idx" ON "AccountPatientLink"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountPatientLink_accountId_patientId_key" ON "AccountPatientLink"("accountId", "patientId");

-- CreateIndex
CREATE UNIQUE INDEX "LinkCode_code_key" ON "LinkCode"("code");

-- CreateIndex
CREATE INDEX "LinkCode_code_idx" ON "LinkCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ShareGrant_code_key" ON "ShareGrant"("code");

-- CreateIndex
CREATE INDEX "ShareGrant_code_idx" ON "ShareGrant"("code");

-- CreateIndex
CREATE INDEX "ShareAccess_grantId_idx" ON "ShareAccess"("grantId");

-- AddForeignKey
ALTER TABLE "AccountPatientLink" ADD CONSTRAINT "AccountPatientLink_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountPatientLink" ADD CONSTRAINT "AccountPatientLink_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareGrant" ADD CONSTRAINT "ShareGrant_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareAccess" ADD CONSTRAINT "ShareAccess_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "ShareGrant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
