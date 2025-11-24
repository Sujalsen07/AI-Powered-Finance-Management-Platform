import { db } from "@/lib/prisma";

export default async function TestDBPage() {
  let connectionStatus = "Unknown";
  let testResult = null;
  let error = null;

  // Test database connection
  try {
    // Try to query the database
    const userCount = await db.user.count();
    connectionStatus = "✅ Connected";
    testResult = `Database connection successful! Found ${userCount} user(s) in database.`;
  } catch (dbError) {
    connectionStatus = "❌ Failed";
    error = {
      message: dbError.message,
      code: dbError.code,
      meta: dbError.meta,
    };
  }

  // Try to get all users
  let users = [];
  try {
    users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  } catch (err) {
    // Error already captured above
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Database Connection Test</h1>

      <div className="bg-blue-50 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        <p className="text-2xl mb-2">{connectionStatus}</p>
        {testResult && <p className="text-green-700">{testResult}</p>}
        {error && (
          <div className="mt-4 p-4 bg-red-100 rounded">
            <p className="font-semibold text-red-800">Error Details:</p>
            <pre className="text-sm mt-2 overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Users in Database ({users.length})</h2>
        {users.length === 0 ? (
          <p className="text-gray-600">No users found. Try signing in and visiting /manual-sync</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 border">ID</th>
                  <th className="px-4 py-2 border">Clerk User ID</th>
                  <th className="px-4 py-2 border">Email</th>
                  <th className="px-4 py-2 border">Name</th>
                  <th className="px-4 py-2 border">Created At</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-2 border text-sm">{user.id.substring(0, 8)}...</td>
                    <td className="px-4 py-2 border text-sm">{user.clerkUserId.substring(0, 20)}...</td>
                    <td className="px-4 py-2 border">{user.email}</td>
                    <td className="px-4 py-2 border">{user.name || "N/A"}</td>
                    <td className="px-4 py-2 border text-sm">{new Date(user.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-yellow-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>If connection failed, check your <code className="bg-gray-200 px-2 py-1 rounded">.env</code> file has correct <code className="bg-gray-200 px-2 py-1 rounded">DATABASE_URL</code></li>
          <li>If connection works but no users: Sign in and visit <code className="bg-gray-200 px-2 py-1 rounded">/manual-sync</code></li>
          <li>Check your Supabase dashboard to verify the connection string is correct</li>
        </ol>
      </div>
    </div>
  );
}



