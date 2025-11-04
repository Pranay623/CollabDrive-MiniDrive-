
import { Input } from "@/components/ui/input";
import { UserButton } from "@clerk/nextjs";
import UserHeader from "@/app/dashboard/user-header";
import { currentUser } from "@clerk/nextjs/server"; 
export default async function Topbar() {
  const user = await currentUser();
  return (
    <div className="h-16 bg-white flex items-center justify-between px-6 border-b">
      <Input
        placeholder="Search your files..."
        className="w-1/3"
      />

      <header className="mb-8">
        <UserHeader 
          firstName={user?.firstName ?? "Collaborator"} 
          email={user?.emailAddresses?.[0]?.emailAddress ?? 'N/A'}
        />
      </header>
    </div>
  );
}
