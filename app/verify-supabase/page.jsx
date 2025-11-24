import { db } from "@/lib/prisma";

export default async function VerifySupabasePage() {
  let users = [];
  let error = null;

  try {
    // Get all users directly from database
    users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    error = err.message;
    console.error("Error fetching users:", err);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Verify Supabase Database</h1>

      {error ? (
        <div className="bg-red-50 p-6 rounded-lg">
          <p className="text-red-800 font-semibold">❌ Error: {error}</p>
        </div>
      ) : (
        <>
          <div className="bg-green-50 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">
              ✅ Users Found in Database: {users.length}
            </h2>
            <p className="text-green-800">
              If you see users here, they ARE in your Supabase database!
            </p>
          </div>

          {users.length > 0 && (
            <div className="bg-white p-6 rounded-lg border mb-6">
              <h2 className="text-xl font-semibold mb-4">User Details</h2>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="border-b pb-4 last:border-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Database ID:</p>
                        <p className="font-mono text-sm">{user.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Clerk User ID:</p>
                        <p className="font-mono text-sm">{user.clerkUserId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email:</p>
                        <p className="font-semibold">{user.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Name:</p>
                        <p>{user.name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Created At:</p>
                        <p className="text-sm">{new Date(user.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">How to View in Supabase Dashboard</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Supabase Dashboard</a></li>
              <li>Select your project</li>
              <li>Click on <strong>"Table Editor"</strong> in the left sidebar</li>
              <li>Click on the <strong>"users"</strong> table</li>
              <li>You should see your user data there!</li>
              <li className="mt-4">
                <strong>Note:</strong> If you don't see the data, try:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Refresh the Supabase dashboard page</li>
                  <li>Make sure you're looking at the correct project</li>
                  <li>Check that the table name is exactly <code className="bg-gray-200 px-1 rounded">users</code> (lowercase)</li>
                </ul>
              </li>
            </ol>
          </div>
        </>
      )}
    </div>
  );
}



