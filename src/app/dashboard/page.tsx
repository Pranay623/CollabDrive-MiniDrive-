import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import UploadBox from "./upload-box";
import FileList from "./file-list";
import UserHeader from "./user-header";
import { syncUserWithDb } from "@/lib/syncUserWithDb";

export default async function DashboardPage() {
  const user = await currentUser();

  // Middleware should handle this, but it's a good server-side fallback
  if (!user) {
    redirect("/sign-in");
  }

  await syncUserWithDb();

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-10">
      {/* 1. Header Bar (Client Component for UserButton) */}
      <header className="mb-8">
        <UserHeader 
          firstName={user.firstName || "Collaborator"} 
          email={user.emailAddresses[0]?.emailAddress || 'N/A'}
        />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 2. Main Drive Area (Files, Upload, Search) - Spans 9/12 columns on large screens */}
        <section className="lg:col-span-9 space-y-8">
          
          <h2 className="text-3xl font-bold text-gray-800">
            CollabDrive Explorer
          </h2>

          {/* Upload Box (Client Component) */}
          <UploadBox />
          
          {/* File Search & Filter Bar */}
          <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-700">My Files</h3>
            <input 
              type="text" 
              placeholder="Search files, tags, or content..."
              className="p-2 border border-gray-300 rounded-lg w-1/3 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {/* File List (Client Component) */}
          <FileList />

        </section>

        {/* 3. Sidebar (Collaboration & AI Features) - Spans 3/12 columns on large screens */}
        <aside className="lg:col-span-3 space-y-8">
            
          {/* Real-Time Collaboration Panel */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-400">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">
                Live Collab Chat
            </h3>
            <p className="text-sm text-gray-600">
                (User-to-User Chat, Group Chat, Typing Indicators)
            </p>
            <div className="mt-4 h-32 bg-blue-50 rounded-md flex items-center justify-center text-xs text-blue-500">
                Chat Interface Placeholder
            </div>
          </div>

          {/* AI Organizer Status */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-400">
            <h3 className="text-xl font-semibold mb-4 text-green-700">
                AI Assistant Status
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
                <p>🤖 **Auto-Tags:** Active</p>
                <p>📂 **Next Sync:** 5 mins</p>
                <p>✨ **New Files:** 3 tagged</p>
                <button className="mt-2 w-full py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition">
                    Manage AI Rules
                </button>
            </div>
          </div>
          
        </aside>
      </div>
    </div>
  );
}
