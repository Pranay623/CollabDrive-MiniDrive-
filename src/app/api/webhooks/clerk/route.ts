// app/api/auth/clerk/route.ts
import { prisma } from "@/lib/db";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;
  if (!WEBHOOK_SECRET)
    return new Response("Missing Clerk webhook secret", { status: 500 });

  const payload = await req.text();
  const headerPayload = Object.fromEntries((await headers()).entries());

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;
  try {
    evt = wh.verify(payload, headerPayload);
  } catch (err) {
    console.error("Invalid Clerk webhook signature:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const { type, data } = evt;

  // Handle user creation and update
  if (type === "user.created" || type === "user.updated") {
    const user = data as any;
    const email = user.email_addresses?.[0]?.email_address;
    await prisma.user.upsert({
      where: { clerkId: user.id },
      update: {
        email,
        name: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
      },
      create: {
        clerkId: user.id,
        email,
        name: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
        password: randomUUID(),
      },
    });
  }

  return new Response("OK", { status: 200 });
}
