"use client";

import { Card, CardContent } from "@/components/ui/card";
import { File as FileIcon, Image, FileText } from "lucide-react";

type DriveFile = {
  id: string;
  name: string;
};

export default function FileGrid({ files }: { files: DriveFile[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {files.map((file) => (
        <Card key={file.id} className="hover:shadow-md cursor-pointer">
          <CardContent className="p-4 flex flex-col items-center">
            <FileIcon size={32} className="text-blue-600 mb-2" />
            <p className="text-sm text-center truncate w-full">{file.name}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
