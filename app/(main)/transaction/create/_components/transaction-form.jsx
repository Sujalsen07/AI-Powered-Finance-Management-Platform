"use client";

import { createTransaction } from "@/actions/transaction";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useFetch from "@/hooks/use-fetch";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema } from "@/lib/schema";
import React from "react";
import { useForm } from "react-hook-form";

const AddTransactionForm = ({accounts, categories})=> {

    useForm({
         resolver: zodResolver(transactionSchema),
         defaultValues:{
            type: "EXPENSE",
            amount: "",
            description: "",
            accountId: accounts.find((ac)=> ac.isDefault)?.id,
            date: new Date(),
            isRecurring: false,
         },
    });

    const {
        loading: transactionLoading,
        fn: transactionFn,
        data: transactionResult,
    } = useFetch(createTransaction);
    return (
        <form>
            {/* AI Recipt Scanner */}
            <div>
                <label>Type</label>
                <Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Theme" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectItem value="light">Light</SelectItem>
      <SelectItem value="dark">Dark</SelectItem>
      <SelectItem value="system">System</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>
            </div>
        </form>
    )
}

export default AddTransactionForm 