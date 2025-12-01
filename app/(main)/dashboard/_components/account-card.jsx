"use client";

import { updateDefaultAccount } from "@/actions/accounts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import useFetch from "@/hooks/use-fetch";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import React, { useEffect } from "react";
import { toast } from "sonner";

const AccountCard = ({ account }) => {
  const { name, type, balance, id, isDefault } = account;

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updateAccount,
    error,
  } = useFetch(updateDefaultAccount);

  const handleDefaultChange = async (checked) => {
    // We only want to set it as default when switching ON
    // and prevent turning off the current default without another default
    if (isDefault && !checked) {
      toast.warning("You need at least one default account");
      return;
    }

    try {
      await updateDefaultFn(id);
    } catch (err) {
      // useFetch already toasts, but you can add extra handling here if needed
      console.error("Failed to update default account", err);
    }
  };

  // Success toast when the update succeeds
  useEffect(() => {
    if (updateAccount?.success) {
      toast.success("Default account updated successfully");
    }
  }, [updateAccount, updateDefaultLoading]);

  // Error toast from hook
  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update default account");
    }
  }, [error]);

  const numericBalance =
    typeof balance === "number" ? balance : parseFloat(balance || "0");

  return (
    <Card className="hover:shadow-md transition-shadow group relative">
      <Link href={`/account/${id}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium capitalize">
            {name}
          </CardTitle>
          <Switch
            checked={isDefault}
            onCheckedChange={handleDefaultChange}
            disabled={updateDefaultLoading}
          />
        </CardHeader>

        <CardContent>
          <div className="text-2xl font-bold">
            ${numericBalance.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground capitalize">
            {type.charAt(0) + type.slice(1).toLowerCase()} Account
          </p>
        </CardContent>

        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
            Income
          </div>
          <div className="flex items-center">
            <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
            Expense
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};

export default AccountCard;
