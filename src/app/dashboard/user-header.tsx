'use client';

import { UserButton } from '@clerk/nextjs';

interface UserHeaderProps {
    firstName: string;
    email: string;
}

export default function UserHeader({ firstName, email }: UserHeaderProps) {
  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">
            Hello, {firstName}
        </h1>
        <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-500 hidden sm:inline">
                {email}
            </span>
            {/* Clerk's UserButton is a client-side component */}
            <UserButton afterSignOutUrl="/" />
        </div>
    </div>
  );
}
