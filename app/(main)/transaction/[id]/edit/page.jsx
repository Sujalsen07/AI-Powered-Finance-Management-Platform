import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getTransaction } from "@/actions/transaction";
import AddTransactionForm from "@/app/(main)/transaction/create/_components/transaction-form";

// Note: in latest Next.js, `params` is a Promise in RSC.
const EditTransactionPage = async (props) => {
  const { id: editId } = await props.params;
  const accounts = await getUserAccounts();

  let initialData = null;
  if (editId) {
    try {
      initialData = await getTransaction(editId);
    } catch {
      initialData = null;
    }
  }

  return (
    <div className="min-h-screen w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      {/* Back link */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 sm:mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors touch-manipulation"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span className="truncate">Back to dashboard</span>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold gradient-title break-words">
          Edit Transaction
        </h1>
      </div>

      {/* Form */}
      <div className="bg-background/40 border border-border/60 rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-5 lg:p-6 backdrop-blur w-full overflow-hidden">
        <AddTransactionForm
          accounts={accounts}
          categories={defaultCategories}
          editMode={true}
          initialData={initialData}
          editId={editId}
        />
      </div>
    </div>
  );
};

export default EditTransactionPage;

