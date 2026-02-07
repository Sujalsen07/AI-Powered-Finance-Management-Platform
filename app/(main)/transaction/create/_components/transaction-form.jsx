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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ReciptScanner from "./recipt-scanner";

const AddTransactionForm = ({ accounts, categories }) => {

    const router = useRouter();

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
    } = useFetch(createTransaction);

    const type = watch("type");
    const isRecurring = watch("isRecurring");
    const date = watch("date");

    const onSubmit = async (data)=> {
        const formData = {
            ...data,
            amount: parseFloat(data.amount),
        };

        const result = await transactionFn(formData);
        if (result?.success && result?.data?.accountId) {
            toast.success("Transaction created successfully");
            reset();
            router.push(`/account/${result.data.accountId}`);
        }
    };

    const filteredCategories = categories.filter(
        (category) => category.type === type
    );

    const handleScanComplete = (scannedData)=> {};

    return (
        <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit(onSubmit)}>

          {/* AI Recipt scanner */}
          <ReciptScanner onScanComplete={handleScanComplete}/>
            {/* Type */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select onValueChange={(value) => setValue("type", value)} defaultValue={type}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="EXPENSE">Expense</SelectItem>
                            <SelectItem value="INCOME">Income</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>

                {errors.type && (
                    <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Amount</label>
                    <Input type="number" step="0.01" placeholder="0.00" className="w-full" {...register("amount")} />
                    {errors.type && (
                        <p className="text-sm text-red-500">{errors.amount.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Account</label>
                    <Select onValueChange={(value) => setValue("accountId", value)} defaultValue={getValues("accountId")}>
                        <SelectTrigger className="w-full">
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

                    {errors.accountId && (
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
          <SelectTrigger className="w-full">
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

       {/* Date */}
       <div className="space-y-2">
        <label className="text-sm font-medium">Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full min-w-0 pl-3 pr-3 text-left font-normal justify-between",
                !date && "text-muted-foreground"
              )}
            >
              {date ? format(date, "PPP") : <span>Pick a date</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => setValue("date", date)}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

       {/* Description */}
       <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Input placeholder="Enter description" className="w-full" {...register("description")} />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

       {/* Recurring Toggle */}
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border p-4">
        <div className="space-y-0.5 min-w-0">
          <label className="text-sm sm:text-base font-medium">Recurring Transaction</label>
          <div className="text-xs sm:text-sm text-muted-foreground">
            Set up a recurring schedule for this transaction
          </div>
        </div>
        <Switch
          checked={isRecurring}
          onCheckedChange={(checked) => setValue("isRecurring", checked)}
          className="shrink-0 self-start sm:self-center"
        />
      </div>

        {/* Recurring Interval */}
        {isRecurring && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Recurring Interval</label>
          <Select
            onValueChange={(value) => setValue("recurringInterval", value)}
            defaultValue={getValues("recurringInterval")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>
          {errors.recurringInterval && (
            <p className="text-sm text-red-500">
              {errors.recurringInterval.message}
            </p>
          )}
        </div>
      )}

       {/* Actions */}
       <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-2">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:flex-1 h-10 sm:h-9"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" className="w-full sm:flex-1 h-10 sm:h-9" disabled={transactionLoading}>
            Create Transaction
        </Button>
      </div>

        </form>
    )
}

export default AddTransactionForm 