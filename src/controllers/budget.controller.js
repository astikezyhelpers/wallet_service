import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getBudget = asyncHandler(async (req, res) => {
    const { user_id } = req.params;

    try {
        const wallet = await prisma.wallet.findUnique({
            where: {
                user_id
            },
            select: {
                wallet_id: true
            }
        })

        if (!wallet) {
            throw new ApiError(404, "No budget found for user")
        }

        const budget = await prisma.budget.findMany({
            where: {
                wallet_id: wallet.wallet_id
            }
        })

        if (budget.length === 0) {
            throw new ApiError(404, "No budget found for user", "BUDGET_NOT_FOUND")
        }

        return res.status(200).json(new ApiResponse(200, budget))

    } catch (error) {
        console.error(error.message);

        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(500, "Failed to create wallet", error.message);
    }
})

const addBudget = asyncHandler(async (req, res) => {
    const { wallet_id, total_amount, period_type, start_date, end_date, created_by } = req.body;

    try {
        const newBudget = await prisma.budget.create({
            data: {
                wallet_id,
                total_amount,
                period_type,
                start_date: new Date(start_date),
                end_date: new Date(end_date),
                created_by,
            }
        })

        return res.status(201).json(new ApiResponse(201,newBudget,"Budget created successfully"));
    } catch (error) {
        console.error(error.message);

        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(500, "Failed to create budget", error.message);
    }
})

// const updateBudget = asyncHandler(async(req,res) => {
//     const {budget_id} = req.params;
//     const {total_amount } = req.body;

//     try{
//         const budget = await prisma.budget.findUnique({
//             where: {budget_id}
//         });

//         if(!budget) throw new ApiError(404, "No budget found", "NOT_FOUND");

//         const updatedBudget = await prisma.budget.update({
//             where:{
//                 budget_id
//             },
//             data: {

//             }
//         })
//     } catch (error) {
//         console.log(error.message);
//         if (error instanceof ApiError) {
//             throw error;
//         }

//         throw new ApiError(400,"error in updating budget",error.message)
//     }
// })

export { getBudget, addBudget };