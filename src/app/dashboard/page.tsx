"use client";

import { useUser } from "@clerk/nextjs";

export default function DashboardPage() {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="p-6">
        <h1 className="text-xl">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl">Welcome, {user?.firstName}</h1>
    </div>
  );
}
