

import { prisma } from "@/lib/prisma";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// @ts-ignore - react-syntax-highlighter has no TypeScript declarations
import SyntaxHighlighter from "react-syntax-highlighter";
// @ts-ignore - react-syntax-highlighter styles have no TypeScript declarations
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";


export default async function FilePreviewPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const file = await prisma.file.findUnique({
    where: { id }
  });

  if (!file) return <div className="p-6">File not found</div>;

  if (!file.s3Key) return <div className="p-6">File has no S3 key</div>;

  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: file.s3Key,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

  const mime = file.mimeType || "";

  return (
    <div className="p-6 flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{file.name}</h1>

      {/* Top Buttons */}
      <div className="flex gap-3">
        <a href={url} download className="bg-blue-600 text-white px-4 py-2 rounded">
          Download
        </a>

        <a href={url} target="_blank" className="bg-gray-200 px-4 py-2 rounded">
          Open in New Tab
        </a>
      </div>

      {/* IMAGE */}
      {mime.startsWith("image/") && (
        <img src={url} alt={file.name} className="max-w-full" />
      )}

      {/* PDF */}
      {mime === "application/pdf" && (
        <iframe src={url} className="w-full h-[80vh] border"></iframe>
      )}

      {/* VIDEO */}
      {mime.startsWith("video/") && (
        <video controls className="max-w-full">
          <source src={url} />
        </video>
      )}

      {/* AUDIO */}
      {mime.startsWith("audio/") && (
        <audio controls>
          <source src={url} />
        </audio>
      )}

      {/* CODE (.js only for now) */}
      {mime.startsWith("text/") && file.name.endsWith(".js") && (
        <SyntaxHighlighter language="javascript" style={atomOneDark}>
          {await fetch(url).then((r) => r.text())}
        </SyntaxHighlighter>
      )}

      {/* FALLBACK */}
      {!mime.startsWith("image/") &&
        !mime.startsWith("video/") &&
        !mime.startsWith("audio/") &&
        mime !== "application/pdf" && (
          <div className="p-6 border rounded bg-white">
            <p>No preview available</p>
            <a href={url} target="_blank" className="underline text-blue-600">
              Download file
            </a>
          </div>
        )}
    </div>
  );
}