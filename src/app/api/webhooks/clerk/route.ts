"use server"
import { prisma } from "@/lib/prisma";
import { Webhook } from "svix";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const payload = await req.text();
  const headerPayload = await headers();
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  type ClerkEvent = {
    type: string;
    data: {
      id: string;
      email_addresses: { email_address: string }[];
      first_name?: string | null;
      last_name?: string | null;
    };
  };

  let evt: ClerkEvent;
  try {
    evt = wh.verify(payload, {
      "svix-id": headerPayload.get("svix-id")!,
      "svix-timestamp": headerPayload.get("svix-timestamp")!,
      "svix-signature": headerPayload.get("svix-signature")!,
    }) as ClerkEvent;
  } catch (err) {
    return new Response("Invalid signature", { status: 400 });
  }

  const { id, email_addresses, first_name, last_name } = evt.data;

  if (evt.type === "user.created") {
    await prisma.user.create({
      data: {
        clerkId: id,
        email: email_addresses[0].email_address,
        name: `${first_name || ""} ${last_name || ""}`.trim(),
      },
    });
  }

  return new Response("OK");
}
