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
import { Input } from "@/components/ui/input";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Button } from "@/components/ui/button";

const AddTransactionForm = ({ accounts, categories }) => {

    const { register, setValue, handleSubmit, formState: { errors }, watch, getValues, reset, } = useForm({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: "EXPENSE",
            amount: "",
            description: "",
            accountId: accounts.find((ac) => ac.isDefault)?.id,
            date: new Date(),
            isRecurring: false,
        },
    });

    const {
        loading: transactionLoading,
        fn: transactionFn,
        data: transactionResult,
    } = useFetch(createTransaction);

    const type = watch("type");
    const isRecurring = watch("isRecurring");
    const date = watch("date");

    const filteredCategories = categories.filter(
        (category) => category.type === type
    );

    return (
        <form className="space-y-6">
            {/* AI Recipt Scanner */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select onValueChange={(value) => setValue("type", value)} defaultValue={type}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="EXPENSES">Expense</SelectItem>
                            <SelectItem value="INCOME">Income</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>

                {errors.type && (
                    <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Amount</label>
                    <Input type="number" step="0.01" placeholder="0.00" {...register("amount")} />
                    {errors.type && (
                        <p className="text-sm text-red-500">{errors.amount.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Account</label>
                    <Select onValueChange={(value) => setValue("accountId", value)} defaultValue={getValues("accountId")}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                    {account.name} (${parseFloat(account.balance).toFixed(2)})
                                </SelectItem>
                            ))}

                            <CreateAccountDrawer>
                                <Button
                                    variant="ghost"
                                    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                >
                                    Create Account
                                </Button>
                            </CreateAccountDrawer>
                        </SelectContent>
                    </Select>

                    {errors.type && (
                        <p className="text-sm text-red-500">{errors.type.message}</p>
                    )}
                </div>
            </div>


            {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Select
          onValueChange={(value) => setValue("category", value)}
          defaultValue={getValues("category")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>

        </form>
    )
}

export default AddTransactionForm 