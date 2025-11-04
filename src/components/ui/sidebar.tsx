"use client";

import Link from "next/link";
import { Home, FolderSymlink, Upload, Settings } from "lucide-react";

export default function Sidebar() {
  return (
    <div className="w-64 h-full bg-white border-r p-4 hidden md:block">
      <h1 className="text-2xl font-semibold mb-6">CollabDrive</h1>

      <nav className="flex flex-col gap-4 text-gray-700">
        <Link href="/dashboard" className="flex items-center gap-2 hover:text-blue-600">
          <Home size={18} /> Home
        </Link>

        <Link href="/dashboard/files" className="flex items-center gap-2 hover:text-blue-600">
          <FolderSymlink size={18} /> My Files
        </Link>

        <Link href="/dashboard/upload" className="flex items-center gap-2 hover:text-blue-600">
          <Upload size={18} /> Upload
        </Link>

        <Link href="/dashboard/settings" className="flex items-center gap-2 hover:text-blue-600">
          <Settings size={18} /> Settings
        </Link>
      </nav>
    </div>
  );
}
