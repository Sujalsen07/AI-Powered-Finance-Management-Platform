"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { endOfDay, format, startOfDay, subDays } from 'date-fns';
import { BarChart } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Day } from 'react-day-picker';
import { Bar, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts'

const DATE_RANGES = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last Month", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  ALL: { label: "All Time", days: null },
};

const AccountChart = ({transactions = []}) => {
    // Log immediately when component renders
    console.log("🔵 AccountChart component RENDERED");
    console.log("🔵 Transactions received:", transactions);
    console.log("🔵 Transactions length:", transactions?.length || 0);
    
    const [dateRange, setDateRange] = useState("1M");

    const filteredData = useMemo(()=>{
        console.log("🟢 useMemo executing - transactions:", transactions?.length || 0, "dateRange:", dateRange);
        if (!transactions || transactions.length === 0) {
            console.log("No transactions provided to AccountChart");
            return [];
        }

        const range = DATE_RANGES[dateRange];
        const now = new Date();
        const startDate = range.days
        ? startOfDay(subDays(now, range.days))
        : startOfDay(new Date(0));

        // Filter transactions within date range 
        const filtered = transactions.filter(
          (t) => {
            const transactionDate = new Date(t.date);
            return transactionDate >= startDate && transactionDate <= endOfDay(now);
          }
        );

        console.log("Filtered transactions:", filtered.length, "out of", transactions.length);

         // Group transactions by date
        const grouped = filtered.reduce((acc, transaction) => {
          const dateKey = format(new Date(transaction.date), "yyyy-MM-dd"); // Use full date for sorting
          const dateLabel = format(new Date(transaction.date), "MMM dd"); // Display label
          
          if (!acc[dateKey]) {
            acc[dateKey] = { date: dateLabel, dateKey, income: 0, expense: 0 };
          }
          
          // Ensure amount is a number
          const amount = typeof transaction.amount === 'number' 
            ? transaction.amount 
            : parseFloat(transaction.amount) || 0;
          
          if (transaction.type === "INCOME") {
            acc[dateKey].income += amount;
          } else {
            acc[dateKey].expense += amount;
          }
          return acc;
        }, {});

        // Convert to array and sort by dateKey (full date string)
        const result = Object.values(grouped).sort(
          (a, b) => a.dateKey.localeCompare(b.dateKey)
        );

        console.log("Chart data array:", result);
        return result;
    },[transactions, dateRange]);

    const totals = useMemo(()=>{
      return filteredData.reduce((acc, day)=>({
        income: acc.income + day.income,
        expense:acc.expense+day.expense,
      }),
    {income:0, expense:0});
  },[filteredData]);

  console.log("🟢 totals:", totals);

    // Log data when it changes
    useEffect(() => {
        console.log("AccountChart - filteredData updated:", filteredData);
        console.log("AccountChart - transactions prop:", transactions);
    }, [filteredData, transactions]); 

    return (
      <Card>
      <CardHeader>
        <CardTitle>Transaction Overview</CardTitle>
        <Select default value={dateRange} onValueChange={setDateRange}>
  <SelectTrigger className="w-[140px]">
    <SelectValue placeholder="select range" />
  </SelectTrigger>
  <SelectContent>{Object.entries(DATE_RANGES).map(([key, {label}])=>{
    return <SelectItem key={key} value={key}>{label}</SelectItem>

  })}
  </SelectContent>
</Select>
      </CardHeader>
      <CardContent>
        {/* <BarChart
      style={{ width: '100%', maxWidth: '700px', maxHeight: '70vh', aspectRatio: 1.618 }}
      responsive
      data={filteredData}
      margin={{
        top: 5,
        right: 0,
        left: 0,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis width="auto" />
      <Tooltip />
      <Legend />
      <Bar dataKey="income" fill="#82ca9d" activeBar={{ fill: 'green', stroke: 'blue' }} radius={[10, 10, 0, 0]} />
      <Bar dataKey="expense" fill="#8884d8" activeBar={{ fill: 'red', stroke: 'purple' }} radius={[10, 10, 0, 0]} />
    </BarChart> */}
      </CardContent>
      
    </Card>
       
    
  )
}

export default AccountChart