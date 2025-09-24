// app/api/webhooks/clerk/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import prisma from "@/lib/prisma";

const secret = process.env.CLERK_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const payload = await req.text();
  const hdrs = headers();
  const svixId = hdrs.get("svix-id")!;
  const svixTimestamp = hdrs.get("svix-timestamp")!;
  const svixSignature = hdrs.get("svix-signature")!;

  const wh = new Webhook(secret);
  const evt = wh.verify(payload, {
    "svix-id": svixId,
    "svix-timestamp": svixTimestamp,
    "svix-signature": svixSignature,
  }) as any;

  const type = evt.type as string;
  const data = evt.data;

  if (type === "user.created" || type === "user.updated") {
    const email = data.email_addresses?.[0]?.email_address ?? "";
    await prisma.user.upsert({
      where: { externalAuthId: data.id },
      update: {
        email,
        name: data.first_name
          ? `${data.first_name} ${data.last_name ?? ""}`.trim()
          : data.username ?? null,
        imageUrl: data.image_url ?? null,
      },
      create: {
        externalAuthId: data.id,
        email,
        name: data.first_name
          ? `${data.first_name} ${data.last_name ?? ""}`.trim()
          : data.username ?? null,
        imageUrl: data.image_url ?? null,
      },
    });
  }

  if (type === "user.deleted") {
    await prisma.user.deleteMany({ where: { externalAuthId: data.id } });
  }

  return NextResponse.json({ ok: true });
}
