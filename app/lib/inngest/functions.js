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
        const budgetAmount = budget.amount.toNumber();
        const percentage = (totalExpenses / budgetAmount) * 100;

        console.log(`Budget ${budget.id}: ${percentage}% used, lastAlertSent: ${budget.lastAlertSent}`);

        // Convert lastAlertSent to Date if it exists (Prisma returns it as Date, but ensure it's a Date object)
        const lastAlertDate = budget.lastAlertSent ? new Date(budget.lastAlertSent) : null;
        const currentDate = new Date();

        if(percentage >= 80 && (!lastAlertDate || isNewMonth(lastAlertDate, currentDate)))
        { 
            //send email
            console.log(`Sending alert for budget ${budget.id}: ${percentage}% used`);

            //update lastAlertSent
            try {
                const updatedBudget = await db.budget.update({
                    where: {id: budget.id},
                    data: {lastAlertSent: currentDate},
                });
                console.log(`Updated lastAlertSent for budget ${budget.id}:`, updatedBudget.lastAlertSent);
            } catch (error) {
                console.error(`Error updating lastAlertSent for budget ${budget.id}:`, error);
                throw error;
            }
        }
    });
   }
  }
);
 
function isNewMonth(lastAlertSent, currentDate){
    if (!lastAlertSent) return true;
    // Ensure both are Date objects
    const lastAlert = lastAlertSent instanceof Date ? lastAlertSent : new Date(lastAlertSent);
    const current = currentDate instanceof Date ? currentDate : new Date(currentDate);
    return (
        lastAlert.getMonth() !== current.getMonth() ||
        lastAlert.getFullYear() !== current.getFullYear()
    );
}