// app/api/files/list/route.ts
import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser)
      return new Response("User not found in database", { status: 404 });

    const files = await prisma.file.findMany({
      where: { ownerId: dbUser.id },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(files);
  } catch (err) {
    console.error("Error fetching files:", err);
    return new Response("Error fetching files", { status: 500 });
  }
}
