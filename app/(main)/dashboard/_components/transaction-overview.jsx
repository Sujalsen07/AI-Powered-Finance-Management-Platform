"use client";

import React from 'react'

const DashboardOverview = ({ accounts, transactions }) => {
    const [selectedAccountId, setSelectedAccountId] = useState(
        accounts.find((a) => a.isDefault)?.id || accounts[0]?.id || null
    );

    //Filter transactions for the selected account
    const accountTransactions = transactions.filter((t) => t.accountId === selectedAccountId);

    const recentTransactions = accountTransactions.sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0,5);
    return (
        <div>

        </div>
    )
}

export default DashboardOverview;