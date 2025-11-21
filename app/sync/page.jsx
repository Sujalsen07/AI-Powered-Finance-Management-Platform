"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { createUser } from "@/app/actions/createUser";

export default function SyncPage() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const sync = async () => {
        try {
          const userData = {
            clerkUserId: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
            imageUrl: user.imageUrl || null,
          };

          if (!userData.email) {
            setResult({
              success: false,
              error: "User has no email",
            });
            return;
          }

          const syncResult = await createUser(userData);
          setResult(syncResult);
        } catch (error) {
          setResult({
            success: false,
            error: error.message,
          });
        } finally {
          setLoading(false);
        }
      };

      sync();
    } else if (isLoaded && !isSignedIn) {
      setResult({
        success: false,
        error: "Please sign in first",
      });
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, user]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">User Sync</h1>
        <div className="bg-blue-50 p-6 rounded-lg">
          <p className="text-blue-800">Syncing user...</p>
        </div>
      </div>
    );
  }

  if (!result || !result.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">User Sync</h1>
        <div className="bg-red-50 p-6 rounded-lg">
          <p className="text-red-800 font-semibold">❌ Error: {result?.error || "Unknown error"}</p>
          <p className="text-sm mt-2">Make sure you are signed in and refresh the page.</p>
        </div>
      </div>
    );
  }

  if (result.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">User Sync</h1>
        <div className="bg-green-50 p-6 rounded-lg mb-4">
          <p className="text-green-800 font-semibold text-lg mb-2">
            ✅ {result.message}
          </p>
          <div className="space-y-1 text-sm">
            <p><strong>Email:</strong> {result.user.email}</p>
            <p><strong>Name:</strong> {result.user.name || "N/A"}</p>
            <p><strong>ID:</strong> {result.user.id}</p>
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-800">
            Your user has been synced to Supabase! Check your database now.
          </p>
          <p className="text-sm mt-2">
            <a href="/test-db" className="text-blue-600 underline">
              View all users →
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">User Sync</h1>
      <div className="bg-yellow-50 p-6 rounded-lg">
        <p className="text-yellow-800">ℹ️ {result.message}</p>
      </div>
    </div>
  );
}

