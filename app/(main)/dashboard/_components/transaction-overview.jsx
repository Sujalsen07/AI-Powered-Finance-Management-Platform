"use client";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useState } from 'react'

const DashboardOverview = ({ accounts, transactions }) => {
    const [selectedAccountId, setSelectedAccountId] = useState(
        accounts.find((a) => a.isDefault)?.id || accounts[0]?.id || null
    );

    //Filter transactions for the selected account
    const accountTransactions = transactions.filter((t) => t.accountId === selectedAccountId);

    const recentTransactions = accountTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    return (
        <div className='grid gap-4 md:grid-cols-2'>
            <Card>
                <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Card Content</p>
                </CardContent>

            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card Description</CardDescription>
                    <CardAction>Card Action</CardAction>
                </CardHeader>
                <CardContent>
                    <p>Card Content</p>
                </CardContent>

            </Card>
        </div>
    )
}

export default DashboardOverview;