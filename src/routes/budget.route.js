import express from "express";
import { addBudget, getBudget } from "../controllers/budget.controller.js";

const router = express.Router();

router.get("/budget/:user_id", getBudget);
router.post("/budget", addBudget);
// router.post("/wallet/:wallet_id/transactions", addTransaction);

export default router;