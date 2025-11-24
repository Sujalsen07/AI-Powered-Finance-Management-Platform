import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function TestUsersPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  // Get all users from database
  let dbUsers = [];
  let currentDbUser = null;
  let error = null;

  try {
    dbUsers = await db.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Find current user in database
    currentDbUser = await db.user.findUnique({
      where: { clerkUserId: clerkUser.id },
    });
  } catch (err) {
    error = err.message;
    console.error("Database error:", err);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">User Database Test Page</h1>

      {/* Current Clerk User Info */}
      <div className="bg-blue-50 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Clerk User</h2>
        <div className="space-y-2">
          <p><strong>ID:</strong> {clerkUser.id}</p>
          <p><strong>Email:</strong> {clerkUser.emailAddresses[0]?.emailAddress}</p>
          <p><strong>Name:</strong> {clerkUser.firstName} {clerkUser.lastName}</p>
        </div>
      </div>

      {/* Current User in Database */}
      <div className="bg-green-50 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Your Database Record</h2>
        {currentDbUser ? (
          <div className="space-y-2">
            <p className="text-green-700 font-semibold">✅ User found in database!</p>
            <p><strong>Database ID:</strong> {currentDbUser.id}</p>
            <p><strong>Clerk User ID:</strong> {currentDbUser.clerkUserId}</p>
            <p><strong>Email:</strong> {currentDbUser.email}</p>
            <p><strong>Name:</strong> {currentDbUser.name || "N/A"}</p>
            <p><strong>Created:</strong> {new Date(currentDbUser.createdAt).toLocaleString()}</p>
          </div>
        ) : (
          <p className="text-red-700 font-semibold">❌ User not found in database. Try refreshing the page.</p>
        )}
      </div>

      {/* All Users in Database */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">All Users in Database ({dbUsers.length})</h2>
        {error ? (
          <p className="text-red-700">Error: {error}</p>
        ) : dbUsers.length === 0 ? (
          <p className="text-gray-600">No users found in database yet.</p>
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
                {dbUsers.map((user) => (
                  <tr key={user.id} className={user.id === currentDbUser?.id ? "bg-yellow-100" : ""}>
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

      {/* Instructions */}
      <div className="bg-yellow-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">How to Check Users</h2>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>This Page:</strong> Visit this page after signing in to see all users</li>
          <li><strong>Supabase Dashboard:</strong> Go to your Supabase project → Table Editor → users table</li>
          <li><strong>API Endpoint:</strong> Visit <code className="bg-gray-200 px-2 py-1 rounded">/api/sync-user</code> while signed in</li>
          <li><strong>Server Logs:</strong> Check terminal for "checkUser: ✅ Successfully created new DB user" messages</li>
        </ul>
      </div>
    </div>
  );
}



