// lib/syncUserWithDb.ts
import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function syncUserWithDb() {
  const user = await currentUser();
  if (!user) return null;

  const email = user.emailAddresses[0]?.emailAddress || "";

  const dbUser = await prisma.user.upsert({
    where: { clerkId: user.id },
    update: {
      email,
      name: user.fullName || null,
    },
    create: {
      clerkId: user.id,
      email,
      name: user.fullName || null,
      password: "",
    },
  });

  return dbUser;
}
