import { getAccountWithTransactions } from "@/actions/accounts";
import { notFound } from "next/navigation";

export default async function AccountsPage({ params }) {
  const resolvedParams = await params
  const accountId = resolvedParams.id

  const accountData = await getAccountWithTransactions(accountId);
  if(!accountData){
    notFound();
  } 
  
  return (
    <div className="py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Account Details</h1>
        <p className="text-gray-600 mt-2">Account ID: {accountId}</p>
      </div>
    </div>
  )
}
