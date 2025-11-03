// app/api/files/download/route.ts
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/s3";
import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("id");
    if (!fileId) return new Response("Missing file ID", { status: 400 });

    const user = await currentUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser)
      return new Response("User not found in database", { status: 404 });

    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file || file.ownerId !== dbUser.id)
      return new Response("File not found or access denied", { status: 404 });

    // Generate pre-signed URL (valid for 1 hour)
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: file.s3Key!,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return Response.json({ url });
  } catch (err) {
    console.error("Error generating download URL:", err);
    return new Response("Error generating download URL", { status: 500 });
  }
}
