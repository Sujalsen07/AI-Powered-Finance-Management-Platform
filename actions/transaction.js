import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function createTransaction(data) {
    
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        //Arcjet to add rate limiting 
    
        const user = await db.user.findUnique({
            where: {clerkUserId: userId},
        });
        if(!user) {
            throw new Error("user not found");
        }

        const account  = await db.account.findUnique({
            where: {
                id: data.accountId,
                userId: user.id,
            },
        });

        if(!account){
            throw new Error("Account not found");
        }
    } catch (error){}
}