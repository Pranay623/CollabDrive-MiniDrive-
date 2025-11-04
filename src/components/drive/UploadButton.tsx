"use client";

import { Plus } from "lucide-react";

export default function UploadButton() {
  return (
    <button
      className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700"
      onClick={() => window.location.href = "/dashboard/upload"}
    >
      <Plus size={24} />
    </button>
  );
}
