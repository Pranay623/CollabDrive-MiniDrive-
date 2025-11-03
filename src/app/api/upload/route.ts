import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    // Find or create user in DB
    const email = user.emailAddresses[0]?.emailAddress || "unknown";

    const dbUser = await prisma.user.upsert({
      where: { clerkId: user.id },
      update: { email, name: user.fullName || null },
      create: {
        clerkId: user.id,
        email,
        name: user.fullName || null,
      },
    });

    if (!dbUser) {
      return new Response("User not found in database", { status: 404 });
    }

    const folderName = dbUser.email.replace(/[@.]/g, "_"); 

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return new Response("No file uploaded", { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

   const s3Key = `${folderName}/${Date.now()}-${file.name}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: s3Key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const dbFile = await prisma.file.create({
      data: {
        name: file.name,
        ownerId: dbUser.id,
        size: file.size,
        mimeType: file.type,
        s3Key,
      },
    });

    return Response.json({ success: true, file: dbFile });
  } catch (err) {
    console.error(err);
    return new Response("Upload error", { status: 500 });
  }
}
