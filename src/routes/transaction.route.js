import express from "express";
import { addTransaction, getTransaction } from "../controllers/transaction.controller.js";

const router = express.Router();

router.get("/wallet/:wallet_id/transactions", getTransaction);
router.post("/wallet/:wallet_id/transactions", addTransaction);

export default router;