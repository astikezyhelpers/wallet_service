import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import prisma from "../lib/prisma.js"
import { Prisma } from "@prisma/client";

const getWalletByUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    try {
        const wallet = await prisma.wallet.findUnique({
            where: { user_id: userId },
        });

        if (!wallet) throw new ApiError(404,"wallet not found", "NOT_FOUND");

        return res.status(200).json(new ApiResponse(200, wallet))

    } catch (error) {
        console.log(error.message);
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(400,"error in getting wallet")
    }
});

const createWallet = asyncHandler(async (req, res) => {
    const { user_id, initial_balance, currency } = req.body;

    try {
        // Check if wallet already exists for the user
        const existingWallet = await prisma.wallet.findUnique({
            where: { user_id },
        });

        if (existingWallet) {
            throw new ApiError(400, "Wallet already exists for this user");
        }

        const newWallet = await prisma.wallet.create({
            data: {
                user_id,
                balance: new Prisma.Decimal(initial_balance),
                currency,
                status: "ACTIVE",
            },
        });

        return res.status(201).json(new ApiResponse(201, newWallet, "Wallet created successfully"));
    } catch (error) {
        console.error(error.message);

        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(500, "Failed to create wallet");
    }
});

const updateStatus = asyncHandler(async (req,res) => {

    const {wallet_id} = req.params;
    const {status} = req.body;

    const allowedStatuses = ["ACTIVE", "FREEZE", "CLOSE"];

    try {

        if (!allowedStatuses.includes(status)) {
            throw new ApiError(400, "Invalid wallet status. Allowed values are: ACTIVE, FREEZE, CLOSE", "INVALID_STATUS");
        }

        const wallet = await prisma.wallet.findUnique({
            where: { wallet_id },
        });

        if (!wallet) throw new ApiError(404,"wallet not found");

        await prisma.wallet.update({
            where: {
                wallet_id
            },
            data:{
                status,
                // update_at: new Date()
            }
        })

        return res.status(200).json(new ApiResponse(200, "wallet status updated successfully"))

    } catch (error) {
        console.log(error.message);

        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(400,"Error in updating wallet status", error.message)
    }

})

export {getWalletByUser, createWallet, updateStatus}