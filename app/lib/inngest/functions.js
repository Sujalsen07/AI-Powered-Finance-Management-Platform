import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { sendEmail } from "@/actions/send-email";
import EmailTemplate from "@/emails/template";

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

   console.log(`[Budget Check] Found ${budgets.length} budgets to check`);

   for(const budget of budgets){
    const defaultAccount = budget.user.accounts[0];
    if (!defaultAccount) {
        console.log(`[Budget Check] Skipping budget ${budget.id}: No default account found`);
        continue; //skip if no default account
    }

    await step.run(`check-budget-${budget.id}`, async ()=> {

        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const expenses = await db.transaction.aggregate({
            where: {
                userId: budget.userId,
                accountId: defaultAccount.id,
                type: "EXPENSE",
                date:{
                    gte: startOfMonth,
                    lte: endOfMonth,
                },
            },
            _sum:{
                amount: true,
            },
        });

        const totalExpenses = expenses._sum.amount ?? 0;
        const budgetAmount = budget.amount;
        const percentage = budgetAmount > 0 ? (totalExpenses / budgetAmount) * 100 : 0;
        const formattedPercentage = percentage.toFixed(2);

        console.log(`[Budget Check] Budget ${budget.id}: ${formattedPercentage}% used (${totalExpenses}/${budgetAmount}), lastAlertSent: ${budget.lastAlertSent}`);

        // Convert lastAlertSent to Date if it exists (Prisma returns it as Date, but ensure it's a Date object)
        const lastAlertDate = budget.lastAlertSent ? new Date(budget.lastAlertSent) : null;

        if (percentage >= 80 && (!lastAlertDate || isNewMonth(lastAlertDate, currentDate))) { 
            //send email
            console.log(`Sending alert for budget ${budget.id}: ${formattedPercentage}% used`);
            await sendEmail({
                to: budget.user.email,
                subject: `Budget Alert for ${defaultAccount.name}`,
                react: (
                  <EmailTemplate
                    userName={budget.user.name}
                    type="budget-alert"
                    data={{
                      percentageUsed: percentage,
                      budgetAmount,
                      totalExpenses,
                      accountName: defaultAccount.name,
                    }}
                  />
                ),
            });

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