import React from 'react'

const AccountPage = ({ params }) => {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Account Details</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">Account ID: {params.id}</p>
        <p className="text-gray-600 mt-2">Account details will be displayed here.</p>
      </div>
    </div>
  )
}

export default AccountPage
