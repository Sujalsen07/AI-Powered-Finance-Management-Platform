import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import React from "react";
import AddTransactionForm from "./_components/transaction-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const AddTransactionPage = async () => {
  const accounts = await getUserAccounts();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 space-y-6 sm:space-y-8">
      {/* Back link */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to dashboard</span>
        </Link>
      </div>

      {/* Header */}
      <div className="max-w-3xl mx-auto px-5">
        <h1 className="text-5xl sm:text-4xl lg:text-5xl font-bold gradient-title mb-8">
          Add Transaction
        </h1>
       
      </div>

      {/* Form */}
      <div className="bg-background/40 border border-border/60 rounded-xl sm:rounded-2xl shadow-sm p-3 sm:p-4 lg:p-6 backdrop-blur">
        <AddTransactionForm
          accounts={accounts}
          categories={defaultCategories}
        />
      </div>
    </div>
  );
};

export default AddTransactionPage;