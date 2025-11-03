import { s3 } from "@/lib/s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return new Response("Missing file ID", { status: 400 });

    const user = await currentUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser)
      return new Response("User not found in database", { status: 404 });

    const file = await prisma.file.findUnique({ where: { id } });
    if (!file || file.ownerId !== dbUser.id)
      return new Response("File not found or access denied", { status: 404 });

    // Delete from S3
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: file.s3Key!,
      })
    );

    // Delete from DB
    await prisma.file.delete({ where: { id } });

    return new Response("File deleted successfully", { status: 200 });
  } catch (err) {
    console.error("Delete error:", err);
    return new Response("Error deleting file", { status: 500 });
  }
}
