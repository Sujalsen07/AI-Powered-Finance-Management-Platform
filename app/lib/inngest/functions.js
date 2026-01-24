import { db } from "@/lib/prisma";
import { inngest } from "./client";

export const checkBudgetAlert = inngest.createFunction(
  { name: "Check Budget Alerts" },
  { cron: "0 */6 * * *" },
  async ({ step }) => {
   const budgets = await step.run("fetch-budget", async()=>{
        return await db.budget.findMany({
            include:{
                user: {
                    include:{
                        accounts:{
                            where:{
                                isDefault: true,
                            },
                        },
                    },
                },
            },
        });
   });

   for(const budget of budgets){
    const defaultAccount = budget.user.accounts[0];
    if (!defaultAccount) continue; //skip if no default account

    await step.run(`check-budget-${budget.id}`, async ()=> {
        const startDate = new Date();
        startDate.setDate(1); //start of current month

        const expenses = await db.transaction.aggregate({
            where: {
                userId: budget.userId,
                accountId: defaultAccount.id,
                type: "EXPENSE",
                date:{
                    gte: startDate,
                },
            },
            _sum:{
                amount: true,
            },
        });

        const totalExpenses = expenses._sum.amount?.toNumber() || 0;
        const budgetAmount = budget.amount;
        const percentage = (totalExpenses / budgetAmount) * 100;

        if(percentage >= 80 && (!budget.lastAlertSent || isNewMonth(budget.lastAlertSent, new Date())))
        {
            //send email

            //update lastAlertSent
            await db.budget.update({
                where: {id: budget.id},
                data: {lastAlertSent: new Date()},
            });
        }
    });
   }
  }
);
 
function isNewMonth(lastAlertSent, currentDate){
    if (!lastAlertSent) return true;
    return (
        lastAlertSent.getMonth() !== currentDate.getMonth() ||
        lastAlertSent.getFullYear() !== currentDate.getFullYear()
    );
}