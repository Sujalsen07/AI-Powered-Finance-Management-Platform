import { getAccountWithTransactions } from "@/actions/accounts";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import TransactionTable from "../_components/transaction-table";
import AccountChart from "../_components/account-chart";
import { BarLoader } from "react-spinners";

export default async function AccountsPage({ params }) {
  const resolvedParams = await params
  const accountId = resolvedParams.id

  const accountData = await getAccountWithTransactions(accountId);
  if(!accountData){
    notFound();
  } 

  const {transactions, ...account} = accountData;
  
  return (
    <div className="space-y-8 px-5 ">

    <div className="py-6 flex gap-4 items-end justify-between">
      <div className="mb-6">
        <h1 className="text-4xl sm:text-6xl font-bold gradient-title capitalize">{account.name}</h1>
        <p className="text-muted-foreground">{account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account</p>
      </div>

      <div className="text-right pb-2">
        <div className="text-xl sm:text-2xl font-bold">${parseFloat(account.balance).toFixed(2)}</div>
        <p className="text-sm text-muted-foreground">{account._count.transactions} Transactions</p>
      </div>
    </div>
      {/* Chart sections */}
      <AccountChart transactions={transactions} />


      {/* Transactions Table */}
      <Suspense fallback={<BarLoader color="#9333ea" className="mt-4" width={"100%"} />}>
        <TransactionTable transactions={transactions}/>
      </Suspense>

    </div>
  )
}
