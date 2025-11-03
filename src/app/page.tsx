
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const user = await currentUser();

  if (user) redirect("/dashboard");

  return (
    <div className="text-center py-20 bg-white rounded-lg shadow-xl">
      <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
        Welcome to <span className="text-blue-600">CollabDrive</span>
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Your mini cloud drive, supercharged with real-time collaboration and AI-powered organization.
      </p>
      
      {/* Call to Action Buttons */}
      <div className="space-x-4">
        <Link 
          href="/sign-up" 
          className="px-8 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-150 shadow-md"
        >
          Start Collaborating (Sign Up)
        </Link>
        <Link 
          href="/sign-in" 
          className="px-8 py-3 text-lg font-semibold text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition duration-150"
        >
          I already have an account (Sign In)
        </Link>
      </div>
      
      <p className="mt-12 text-gray-500 text-sm">
        Experience the next generation of file management.
      </p>
    </div>
  );
}
