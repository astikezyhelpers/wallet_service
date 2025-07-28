import express from 'express';
import cookieParser from "cookie-parser";
import { errorHandler } from './middleware/errorHandler.middleware.js';

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import walletRouter from "./routes/wallet.route.js";
import transactionRouter from "./routes/transaction.route.js";
import budgetRouter from "./routes/budget.route.js";

app.use("/api/v1",walletRouter)
app.use("/api/v1", transactionRouter);
app.use("/api/v1", budgetRouter);

app.use(errorHandler);

export { app };