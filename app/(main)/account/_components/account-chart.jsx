"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { endOfDay, format, startOfDay, subDays } from 'date-fns';
import { useEffect, useMemo, useState } from 'react'
import { Day } from 'react-day-picker';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const DATE_RANGES = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last Month", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  ALL: { label: "All Time", days: null },
};

// Helper function to parse amount from various formats
const parseAmount = (amount) => {
  if (amount === null || amount === undefined) return 0;
  if (typeof amount === 'number') return amount;
  if (amount && typeof amount.toNumber === 'function') {
    // Handle Prisma Decimal objects
    return amount.toNumber();
  }
  const parsed = parseFloat(amount);
  return isNaN(parsed) ? 0 : parsed;
};

// Helper function to parse date
const parseDate = (date) => {
  if (!date) return null;
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const AccountChart = ({ transactions = [] }) => {
  console.log("🔵 AccountChart component RENDERED");
  console.log("🔵 Transactions received:", transactions);
  console.log("🔵 Transactions length:", transactions?.length || 0);

  const [dateRange, setDateRange] = useState("ALL");
  
  // Store transactions in state to prevent data loss on re-renders
  const [transactionsState, setTransactionsState] = useState(() => {
    const initial = Array.isArray(transactions) ? transactions : [];
    console.log("🟡 Initializing transactions state:", initial.length);
    return initial;
  });

  // Update state when transactions prop changes (always update, even if empty initially)
  useEffect(() => {
    if (Array.isArray(transactions)) {
      console.log("🟡 Updating transactions state:", transactions.length, "transactions");
      setTransactionsState(transactions);
    } else {
      console.log("🟡 Transactions prop is not an array, resetting state");
      setTransactionsState([]);
    }
  }, [transactions]);

  // Use the most up-to-date transactions (prefer prop if it has data, otherwise use state)
  const transactionsToUse = useMemo(() => {
    const propTransactions = Array.isArray(transactions) ? transactions : [];
    const stateTransactions = Array.isArray(transactionsState) ? transactionsState : [];
    
    // Prefer prop if it has data, otherwise use state
    const result = propTransactions.length > 0 ? propTransactions : stateTransactions;
    
    console.log("🟡 Using transactions:", result.length, "from state:", stateTransactions.length, "from prop:", propTransactions.length);
    return result;
  }, [transactions, transactionsState]);

  // Filter and group data for chart display
  const filteredData = useMemo(() => {
    console.log("🟢 useMemo executing - transactions:", transactionsToUse?.length || 0, "dateRange:", dateRange);
    
    if (!transactionsToUse || transactionsToUse.length === 0) {
      console.log("No transactions provided to AccountChart");
      return [];
    }

    const range = DATE_RANGES[dateRange];
    const now = new Date();
    const endDate = endOfDay(now);
    const startDate = range.days
      ? startOfDay(subDays(now, range.days))
      : startOfDay(new Date(0));

    console.log("🟢 Date range:", { 
      startDate: startDate.toISOString(), 
      endDate: endDate.toISOString(), 
      days: range.days,
      range: dateRange 
    });

    // Sample a few transaction dates to debug
    if (transactionsToUse.length > 0) {
      const sampleDates = transactionsToUse.slice(0, 3).map(t => ({
        raw: t.date,
        parsed: parseDate(t.date)?.toISOString(),
        type: t.type,
        amount: t.amount
      }));
      console.log("🟢 Sample transaction dates:", sampleDates);
    }

    // Filter transactions within date range 
    const filtered = transactionsToUse.filter((t) => {
      const transactionDate = parseDate(t.date);
      if (!transactionDate) {
        console.warn("Invalid date for transaction:", t);
        return false;
      }
      
      const isInRange = transactionDate >= startDate && transactionDate <= endDate;
      if (!isInRange && transactionsToUse.length <= 5) {
        // Only log for small datasets to avoid spam
        console.log("Transaction out of range:", {
          date: transactionDate.toISOString(),
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          beforeStart: transactionDate < startDate,
          afterEnd: transactionDate > endDate
        });
      }
      return isInRange;
    });

    console.log("🟢 Filtered transactions:", filtered.length, "out of", transactionsToUse.length);
    if (filtered.length === 0 && transactionsToUse.length > 0) {
      console.warn("⚠️ No transactions in date range! Check date range settings.");
    }

    // Group transactions by date
    const grouped = filtered.reduce((acc, transaction) => {
      const transactionDate = parseDate(transaction.date);
      if (!transactionDate) return acc;

      const dateKey = format(transactionDate, "yyyy-MM-dd");
      const dateLabel = format(transactionDate, "MMM dd");

      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateLabel, dateKey, income: 0, expense: 0 };
      }

      const amount = parseAmount(transaction.amount);

      if (transaction.type === "INCOME") {
        acc[dateKey].income += amount;
      } else if (transaction.type === "EXPENSE") {
        acc[dateKey].expense += amount;
      }
      
      return acc;
    }, {});

    // Convert to array and sort by dateKey
    const result = Object.values(grouped).sort(
      (a, b) => a.dateKey.localeCompare(b.dateKey)
    );

    console.log("🟢 Chart data array:", result);
    console.log("🟢 Chart data sample:", result.slice(0, 3));
    return result;
  }, [transactionsToUse, dateRange]);

  // Calculate totals from filtered transactions (matching the selected date range)
  const totals = useMemo(() => {
    if (!transactionsToUse || transactionsToUse.length === 0) {
      console.log("🟢 No transactions, returning zero totals");
      return { income: 0, expense: 0 };
    }

    const range = DATE_RANGES[dateRange];
    const now = new Date();
    const endDate = endOfDay(now);
    const startDate = range.days
      ? startOfDay(subDays(now, range.days))
      : startOfDay(new Date(0));

    // Calculate totals directly from filtered transactions
    const result = transactionsToUse.reduce(
      (acc, transaction) => {
        const transactionDate = parseDate(transaction.date);
        if (!transactionDate) return acc;

        // Check if transaction is in date range
        if (transactionDate < startDate || transactionDate > endDate) {
          return acc;
        }

        const amount = parseAmount(transaction.amount);
        
        if (transaction.type === "INCOME") {
          acc.income += amount;
        } else if (transaction.type === "EXPENSE") {
          acc.expense += amount;
        }
        
        return acc;
      },
      { income: 0, expense: 0 }
    );

    // Ensure values are numbers
    const finalResult = {
      income: Number(result.income) || 0,
      expense: Number(result.expense) || 0
    };
    
    console.log("🟢 Calculated totals from filtered transactions:", finalResult);
    console.log("🟢 Date range:", { startDate, endDate, range: dateRange });
    return finalResult;
  }, [transactionsToUse, dateRange]);

  // Log data when it changes
  useEffect(() => {
    console.log("🟢 AccountChart - filteredData updated:", filteredData);
    console.log("🟢 AccountChart - totals:", totals);
    console.log("🟢 AccountChart - transactionsToUse:", transactionsToUse);
    console.log("🟢 AccountChart - transactions prop:", transactions);
  }, [filteredData, totals, transactionsToUse, transactions]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <CardTitle className="text-2xl font-bold">Transaction Overview</CardTitle>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="select range" />
          </SelectTrigger>
          <SelectContent>{Object.entries(DATE_RANGES).map(([key, { label }]) => {
            return <SelectItem key={key} value={key}>{label}</SelectItem>

          })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className='flex justify-around mb-6 text-sm'>
          <div className='text-center'>
            <p className='text-muted-foreground text-sm '>Total Income</p>
            <p className='text-lg font-bold text-green-500 '> ${(Number(totals.income) || 0).toFixed(2)}</p>
          </div>
          <div className='text-center'>
            <p className='text-muted-foreground text-sm '>Total Expense</p>
            <p className='text-lg font-bold text-red-500 '> ${(Number(totals.expense) || 0).toFixed(2)}</p>
          </div>
          <div className='text-center'>
            <p className='text-muted-foreground text-sm '>Net</p>
            <p className={`text-lg font-bold ${(Number(totals.income) - Number(totals.expense)) >= 0 ? 'text-green-500' : 'text-red-500'}`}> ${((Number(totals.income) || 0) - (Number(totals.expense) || 0)).toFixed(2)}</p>
          </div>
        </div>

        <div className='h-[300px]'>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={(value) => [`$${value}`, undefined]}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Bar
                dataKey="income"
                name="Income"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expense"
                name="Expense"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
    </div>
      </CardContent>

    </Card>


  )
}

export default AccountChart