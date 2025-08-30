-- CreateTable
CREATE TABLE "Wallet" (
    "wallet_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("wallet_id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "txn_id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "reference_id" TEXT,
    "reference_type" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("txn_id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "budget_id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "total_amount" DECIMAL(65,30) NOT NULL,
    "used_amount" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "period_type" TEXT NOT NULL DEFAULT 'MONTHLY',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("budget_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_user_id_key" ON "Wallet"("user_id");

-- CreateIndex
CREATE INDEX "idx_wallets_status" ON "Wallet"("status");

-- CreateIndex
CREATE INDEX "idx_transactions_wallet_id" ON "Transaction"("wallet_id");

-- CreateIndex
CREATE INDEX "idx_transactions_type" ON "Transaction"("type");

-- CreateIndex
CREATE INDEX "idx_transactions_status" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "idx_transactions_created_at" ON "Transaction"("created_at");

-- CreateIndex
CREATE INDEX "idx_transactions_reference" ON "Transaction"("reference_id", "reference_type");

-- CreateIndex
CREATE INDEX "idx_budgets_wallet_id" ON "Budget"("wallet_id");

-- CreateIndex
CREATE INDEX "idx_budgets_period" ON "Budget"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "idx_budgets_status" ON "Budget"("status");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "Wallet"("wallet_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "Wallet"("wallet_id") ON DELETE RESTRICT ON UPDATE CASCADE;
