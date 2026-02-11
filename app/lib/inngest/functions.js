import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { sendEmail } from "@/actions/send-email";
import EmailTemplate from "@/emails/template";
import { id, is } from "date-fns/locale";
import { date } from "zod";

export const checkBudgetAlert = inngest.createFunction(
    { name: "Check Budget Alerts" },
    { cron: "0 */6 * * *" },
    async ({ step }) => {
        const budgets = await step.run("fetch-budget", async () => {
            return await db.budget.findMany({
                include: {
                    user: {
                        include: {
                            accounts: {
                                where: {
                                    isDefault: true,
                                },
                            },
                        },
                    },
                },
            });
        });

        console.log(`[Budget Check] Found ${budgets.length} budgets to check`);

        for (const budget of budgets) {
            const defaultAccount = budget.user.accounts[0];
            if (!defaultAccount) {
                console.log(`[Budget Check] Skipping budget ${budget.id}: No default account found`);
                continue; //skip if no default account
            }

            await step.run(`check-budget-${budget.id}`, async () => {

                const currentDate = new Date();
                const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

                const expenses = await db.transaction.aggregate({
                    where: {
                        userId: budget.userId,
                        accountId: defaultAccount.id,
                        type: "EXPENSE",
                        date: {
                            gte: startOfMonth,
                            lte: endOfMonth,
                        },
                    },
                    _sum: {
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
                            where: { id: budget.id },
                            data: { lastAlertSent: currentDate },
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

function isNewMonth(lastAlertSent, currentDate) {
    if (!lastAlertSent) return true;
    // Ensure both are Date objects
    const lastAlert = lastAlertSent instanceof Date ? lastAlertSent : new Date(lastAlertSent);
    const current = currentDate instanceof Date ? currentDate : new Date(currentDate);
    return (
        lastAlert.getMonth() !== current.getMonth() ||
        lastAlert.getFullYear() !== current.getFullYear()
    );
}

export const triggerRecurringTransactions = inngest.createFunction({
    id: "trigger-recurring-transactions",
    name: "Trigger Recurring Transactions"
}, { cron: "0 0 * * *" },
    async ({ step }) => {
        //1. fetch all due recurring transactions
        const recurringTransactions = await step.run(
            "fetch-recurring-transactions",
            async () => {
                return await db.transaction.findMany({
                    where: {
                        isRecurring: true,
                        status: "COMPLETED",
                        OR: [
                            { lastProcessed: null },
                            {
                                nextRecurringDate: {
                                    lte: new Date(),
                                },
                            },
                        ],
                    },
                });

            }
        );

        //2. create events for each transactions
        // Send event for each recurring transaction in batches
        if (recurringTransactions.length > 0) {
            const events = recurringTransactions.map((transaction) => ({
                name: "transaction.recurring.process",
                data: {
                    transactionId: transaction.id,
                    userId: transaction.userId,
                },
            }));

            // 3. send events to be processed
            await inngest.send(events);
        }

        return { triggered: recurringTransactions.length };
    }
);


export const processRecurringTransactions = inngest.createFunction(
    {
        id: "process-recurring-transaction",
        throttle: {
            limit: 10, //only process 10 transactions
            period: "1m", //per minute
            key: "event.data.userId", //per user
        },
    },
    { event: "transaction.recurring.process" },
    async ({ event, step }) => {
        // validate event data
        if (!event?.data?.transactionId || !event?.data?.userId) {
            console.error("Invalid event data:", event);
            return { error: "Missing required event data" };
        }

        await step.run("process-transaction", async () => {
            const transaction = await db.transaction.findUnique({
                where: {
                    id: event.data.transactionId,
                    userId: event.data.userId,
                },
                include: {
                    account: true,
                },
            });

            if (!transaction || !isTransactionDue(transaction)) return;

            await db.$transaction(async (tx) => {
                // create new transaction
                await tx.transaction.create({
                    data: {
                        type: transaction.type,
                        amount: transaction.amount,
                        description: `${transaction.description} (Recurring)`,
                        date: new Date(),
                        category: transaction.category,
                        userId: transaction.userId,
                        accountId: transaction.accountId,
                        isRecurring: false,
                    },
                });

                //update account balance 
                const balanceChange =
                    transaction.type === "EXPENSE"
                        ? -transaction.amount.toNumber()
                        : transaction.amount.toNumber();

                await tx.account.update({
                    where: { id: transaction.accountId },
                    data: { balance: { increment: balanceChange } },
                });

                //update the last processed date and next recurring date
                await tx.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        lastProcessed: new Date(),
                        nextRecurringDate: calculateNextRecurringDate(
                            new Date(),
                            transaction.recurringInterval
                        ),
                    },
                });
            });
        });
    }
);

function isTransactionDue(transaction) {
    // If no lastProcessed date, transaction is due
    if (!transaction.lastProcessed) return true;

    const today = new Date();
    const nextDue = new Date(transaction.nextRecurringDate);

    // Compare with nextDue date
    return nextDue <= today;
}

function calculateNextRecurringDate(startDate, interval) {
    const next = new Date(startDate);
    switch (interval) {
        case "DAILY":
            next.setDate(next.getDate() + 1);
            break;
        case "WEEKLY":
            next.setDate(next.getDate() + 7);
            break;
        case "MONTHLY":
            next.setMonth(next.getMonth() + 1);
            break;
        case "YEARLY":
            next.setFullYear(next.getFullYear() + 1);
            break;
    }
    return next;
}

export const generateMonthlyReports = inngest.createFunction({
    id: "generate-monthly-reports",
    name: "Generate Monthly Reports"
},
    { cron: "0 0 1 * *" }, async ({step}) => {
        const users = await step.run("fetch-users", async () => {
            return await db.user.findMany({
                include: {
                    accounts: true,
                },
            });
        });
        return await db.user.findMany({
            include: {
                accounts: true,
            },
        });
    }
);