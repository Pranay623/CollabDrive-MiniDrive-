
'use client';

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (

    <div className="flex justify-center items-center py-10">
      <SignUp 
        redirectUrl="/dashboard" 
        appearance={{
          elements: {
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
          },
        }}
      />
    </div>
  );
}