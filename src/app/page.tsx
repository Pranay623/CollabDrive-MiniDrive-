"use client";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen gap-4">
      <SignedOut>
        <h1 className="text-3xl font-bold">Welcome to CollabDrive</h1>
        <SignInButton>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Sign In
          </button>
        </SignInButton>
        <Link href="/sign-up" className="text-blue-500 underline">
          Create an account
        </Link>
      </SignedOut>

      <SignedIn>
        <h1 className="text-2xl">You are signed in ✅</h1>
        <Link
          href="/dashboard"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Go to Dashboard
        </Link>
        <UserButton />
      </SignedIn>
    </main>
  );
}
