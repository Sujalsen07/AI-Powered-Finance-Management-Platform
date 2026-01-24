import { getUserAccounts } from "@/actions/dashboard";
import { getCurrentBudget } from "@/actions/budget";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import React from "react";
import AccountCard from "./_components/account-card";
import BudgetProgress from "../account/_components/budget-progress";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

async function DashboardPage() {
  // Check authentication before calling actions
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const accounts = await getUserAccounts();

  const defaultAccount = accounts?.find((account) => account.isDefault);

  const budgetData = defaultAccount
    ? await getCurrentBudget(defaultAccount.id)
    : null;

  return (
    <div className="space-y-8">
      {/* Budget progress */}
      {defaultAccount && (
        <BudgetProgress
          initialBudget={budgetData?.budget || null}
          currentExpenses={budgetData?.currentExpenses || 0}
        />
      )}

      {/* overview */}

      {/* Accounts Grid */}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer>
          <Card className=" hover:shadow-md transition-shadow cursor-pointer border-dashed">
            <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
              <Plus className="h-10 w-10 mb-2" />
              <p className="text-sm font-medium">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>

        {accounts.length > 0 &&
          accounts?.map((account) => {
            return <AccountCard key={account.id} account={account} />;
          })}
      </div>
    </div>
  );
}
export default DashboardPage;
