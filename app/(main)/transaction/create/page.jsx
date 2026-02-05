import { getUserAccounts } from '@/actions/dashboard';
import React from 'react'

const AddTransactionPage =async () => {
  const accounts = await getUserAccounts();
  
  return (
    <div className="max-w-3xl mx-auto px-5">
      <h1 className="text-5xl gradient-title mb-8">AddTransaction</h1>
    </div>
  )
}

export default AddTransactionPage


