import express from "express";
import { createWallet, getWalletByUser, updateStatus } from "../controllers/wallet.controller.js";
const router = express.Router();

// Wallet Management APIs
router.get("/wallet/:userId", getWalletByUser); // GET /wallets/{userId}
router.post("/wallet", createWallet); // POST /wallets
router.put("/wallet/:wallet_id/status", updateStatus); // POST /wallets
// router.put("/wallets/:walletId/status", walletController.updateWalletStatus); // PUT /wallets/{walletId}/status

export default router;
