export default async function AccountsPage({ params }) {
  const resolvedParams = await params
  const accountId = resolvedParams.id
  
  return (
    <div className="py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Account Details</h1>
        <p className="text-gray-600 mt-2">Account ID: {accountId}</p>
      </div>
    </div>
  )
}
