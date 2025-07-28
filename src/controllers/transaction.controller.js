import prisma from "../lib/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getTransaction = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        start_date,
        end_date,
        type,
        status,
    } = req.query;

    const {wallet_id} = req.params;

    try {
        if (!wallet_id) {
            throw new ApiError(400, "wallet_id is required");
        }

        const filters = {
            wallet_id,
        };

        if (type) {
            filters.type = type; // e.g., CREDIT or DEBIT
        }

        if (status) {
            filters.status = status; // e.g., SUCCESS, PENDING, FAILED
        }

        if (start_date || end_date) {
            filters.created_at = {};
            if (start_date) {
                filters.created_at.gte = new Date(start_date);
            }
            if (end_date) {
                filters.created_at.lte = new Date(end_date);
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where: filters,
                skip,
                take,
                orderBy: {
                    created_at: "desc",
                },
                select: {
                    txn_id: true,
                    amount: true,
                    type: true,
                    description: true,
                    status: true,
                    created_at: true
                }
            }),
            prisma.transaction.count({ where: filters }),
        ]);

        const pagination = {"page": parseInt(page), "limit": parseInt(limit), "total" : total};

        return res.status(200).json(
            new ApiResponse(200, {transactions,pagination})
        );
    } catch (error) {
        console.error(error.message);

        if (error instanceof ApiError) throw error;

        throw new ApiError(500, "Error fetching transactions", error.message);
    }
});

const addTransaction = asyncHandler (async (req,res) => {
    const {wallet_id} = req.params;
    const {amount, type, description, status, metadata, reference_id, reference_type} = req.body;
   

    try {
        const newTransaction = await prisma.transaction.create({
            data: {
                wallet_id,
                amount,
                type,
                description,
                reference_id,
                reference_type,
                status,
                metadata,
            }
        })

        return res.status(201).json(new ApiResponse(201, newTransaction, "Transaction created successfully"));
    } catch (error) {
        console.error(error.message);

        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(500, "Failed to create transaction", error.message); 
    }
})

export {getTransaction, addTransaction};