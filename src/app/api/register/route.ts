// /app/api/register/route.ts
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma"; // Assuming your Prisma client utility file
import { NextResponse } from "next/server"; // Use NextResponse for JSON response

export async function POST(req: Request) {
  try {
    // 1. Get the authenticated user data from Clerk
    const clerkUser = await currentUser();

    // If the request isn't authenticated, reject it.
    if (!clerkUser) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Clerk user data often used for sync
    const clerkId = clerkUser.id;
    const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress;
    const fullName = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();
    // Your schema uses 'name', which we derive from Clerk's first/last name
    
    // NOTE: Your schema has 'imageUrl' but not 'lastName' or 'firstName'. 
    // We'll use 'fullName' for your 'name' field.
    const imageUrl = clerkUser.imageUrl;

    if (!primaryEmail) {
      console.error("Clerk user has no primary email address.");
      return new Response("Missing primary email", { status: 400 });
    }

    // 2. Use Prisma's upsert to create or update the user in one go
    const dbUser = await prisma.user.upsert({
      where: {
        clerkId: clerkId, // Try to find the user by their unique Clerk ID
      },
      update: {
        // If the user EXISTS, update fields that might change
        email: primaryEmail,
        name: fullName || null, // Use null if empty, or '' if field is non-nullable String (best to use null)
        // Your schema uses String? for name, so null is fine.
        // NOTE: Your schema does not have imageUrl. I am commenting it out.
        // imageUrl: imageUrl, 
      },
      create: {
        // If the user DOES NOT EXIST, create them
        clerkId: clerkId,
        email: primaryEmail,
        name: fullName || null,
        // *** CRITICAL FIX: Your schema requires a non-nullable 'password' field. ***
        // Since Clerk handles authentication, we provide a placeholder value.
        // RECOMMENDATION: Make 'password' nullable in your schema (password String?).
        password: "CLERK_MANAGED_USER_NO_PASSWORD", 
        // NOTE: Your schema does not have imageUrl. I am commenting it out.
        // imageUrl: imageUrl, 
      },
    });

    console.log(`User ${dbUser.clerkId} synced with database.`);
    
    // Return the synchronized user object
    return NextResponse.json({ 
      success: true, 
      message: "User successfully registered/synced.", 
      dbUserId: dbUser.id, // This is your internal UUID
      clerkId: dbUser.clerkId 
    }, { status: 200 });
    
  } catch (err) {
    console.error("User synchronization error:", err);
    // Be specific about the error if possible, but default to 500
    return new Response("Database synchronization failed", { status: 500 });
  }
}