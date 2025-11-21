"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { syncUser } from "@/app/actions/syncUser";

export default function ManualSyncPage() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [syncStatus, setSyncStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    setSyncStatus("Syncing...");

    try {
      const result = await syncUser();

      if (result.success) {
        if (result.user) {
          setSyncStatus(`✅ Success! User synced: ${result.user.email}`);
        } else {
          setSyncStatus(`ℹ️ ${result.message}`);
        }
      } else {
        setSyncStatus(`❌ Error: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      setSyncStatus(`❌ Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Manual User Sync</h1>
        <p className="text-red-600">Please sign in first to sync your user data.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manual User Sync</h1>

      <div className="bg-blue-50 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Current Clerk User</h2>
        <div className="space-y-2">
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.emailAddresses[0]?.emailAddress}</p>
          <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Sync User to Database</h2>
        <Button 
          onClick={handleSync} 
          disabled={loading}
          className="mb-4"
        >
          {loading ? "Syncing..." : "Sync User to Database"}
        </Button>
        {syncStatus && (
          <div className={`p-4 rounded ${
            syncStatus.includes("✅") ? "bg-green-100 text-green-800" :
            syncStatus.includes("❌") ? "bg-red-100 text-red-800" :
            "bg-blue-100 text-blue-800"
          }`}>
            {syncStatus}
          </div>
        )}
      </div>

      <div className="bg-yellow-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Make sure you are signed in (you should see your user info above)</li>
          <li>Click the "Sync User to Database" button</li>
          <li>Check the status message to see if sync was successful</li>
          <li>Visit <code className="bg-gray-200 px-2 py-1 rounded">/test-users</code> to verify the user is in the database</li>
          <li>Or check your Supabase dashboard → Table Editor → users table</li>
        </ol>
      </div>
    </div>
  );
}

