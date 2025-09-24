// app/api/webhooks/clerk/route.ts
import { NextResponse } from "next/server";

import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server"; // ✅ use Clerk’s event type
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

const secret = process.env.CLERK_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const payload = await req.text();
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { ok: false, error: "Missing Svix headers" },
      { status: 400 }
    );
  }
  const svixHeaders = {
    "svix-id": svixId,
    "svix-timestamp": svixTimestamp,
    "svix-signature": svixSignature,
  };

  let evt: WebhookEvent; // ✅ strongly typed
  try {
    evt = new Webhook(secret).verify(payload, svixHeaders) as WebhookEvent; // <- no `any`
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid signature" },
      { status: 400 }
    );
  }

  // Optional: narrow useful fields for user.* events
  if (evt.type === "user.created" || evt.type === "user.updated") {
    // A lightweight shape for the parts we read:
    const d = evt.data as {
      id: string;
      first_name?: string | null;
      last_name?: string | null;
      username?: string | null;
      image_url?: string | null;
      primary_email_address_id?: string | null;
      email_addresses?: { id: string; email_address: string }[];
    };

    const email =
      d.email_addresses?.find((e) => e.id === d.primary_email_address_id)
        ?.email_address ??
      d.email_addresses?.[0]?.email_address ??
      null;

    const name =
      d.first_name || d.last_name
        ? `${d.first_name ?? ""} ${d.last_name ?? ""}`.trim()
        : d.username ?? null;

    await prisma.user.upsert({
      where: { externalAuthId: d.id },
      update: {
        email: email ?? undefined,
        name,
        imageUrl: d.image_url ?? null,
      },
      create: {
        externalAuthId: d.id,
        email: email!,
        name,
        imageUrl: d.image_url ?? null,
      },
    });
  }

  if (evt.type === "user.deleted") {
    const d = evt.data as { id: string };
    await prisma.user.deleteMany({ where: { externalAuthId: d.id } });
  }

  return NextResponse.json({ ok: true });
}
