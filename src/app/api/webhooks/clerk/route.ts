// src/app/api/webhooks/clerk/route.ts
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/backend";

export const runtime = "nodejs";

/** ---- Admin Clerk client (explicit) ---- */
const adminClerk = process.env.CLERK_SECRET_KEY
  ? createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
  : null;

/** ---- Helpers ---- */
function need(h: Headers, key: string) {
  const v = h.get(key);
  if (!v) throw new Error(`Missing header: ${key}`);
  return v;
}

/** ---- Types for event payloads we actually use ---- */
type ClerkEmailAddress = {
  id: string;
  email_address: string;
  verification?: { status?: string } | null;
};

type ClerkExternalAccount = {
  email_address?: string | null;
};

interface ClerkUserPayload {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  image_url?: string | null;
  primary_email_address_id?: string | null;
  email_addresses?: ClerkEmailAddress[] | null;
  external_accounts?: ClerkExternalAccount[] | null;
}

interface ClerkSessionPayload {
  id: string;
  user_id?: string | null;
}

/** ---- Shapes we care about for best-email helper ---- */
function getBestEmailFromEvent(u: {
  primary_email_address_id?: string | null;
  email_addresses?: ClerkEmailAddress[] | null;
  external_accounts?: ClerkExternalAccount[] | null;
}) {
  // 1) Primary email (if set)
  if (u.primary_email_address_id && u.email_addresses?.length) {
    const primary = u.email_addresses.find(
      (e) => e.id === u.primary_email_address_id
    );
    if (primary?.email_address) return primary.email_address.toLowerCase();
  }
  // 2) First VERIFIED email
  const verified = u.email_addresses?.find(
    (e) => e.verification?.status === "verified" && !!e.email_address
  );
  if (verified?.email_address) return verified.email_address.toLowerCase();

  // 3) Any email present
  const any = u.email_addresses?.find((e) => !!e.email_address)?.email_address;
  if (any) return any.toLowerCase();

  // 4) OAuth external account fallback
  const ext = u.external_accounts?.find((x) => !!x.email_address)
    ?.email_address;
  if (ext) return ext.toLowerCase();

  // 5) Nothing found
  return null;
}

async function upsertByClerkId(
  clerkUserId: string,
  opts?: {
    email?: string | null;
    name?: string | null;
    imageUrl?: string | null;
  }
) {
  let email = opts?.email ?? null;
  let name = opts?.name ?? null;
  let imageUrl = opts?.imageUrl ?? null;

  // Last-resort: fetch from Clerk only if we have an admin client (helps local & prod)
  if ((!email || !name || !imageUrl) && adminClerk) {
    try {
      const c = await adminClerk.users.getUser(clerkUserId);
      email =
        email ??
        c.primaryEmailAddress?.emailAddress ??
        c.emailAddresses[0]?.emailAddress ??
        null;
      name =
        name ??
        ([c.firstName, c.lastName].filter(Boolean).join(" ") ||
          c.username ||
          email ||
          null);
      imageUrl = imageUrl ?? (c.imageUrl || null);
    } catch (e) {
      console.warn("[webhook] adminClerk.getUser fallback failed:", e);
    }
  }

  // Upsert using your schema (externalAuthId is the unique key to Clerk id)
  return prisma.user.upsert({
    where: { externalAuthId: clerkUserId },
    update: {
      ...(email !== undefined ? { email } : {}),
      ...(name !== undefined ? { name } : {}),
      ...(imageUrl !== undefined ? { imageUrl } : {}),
    },
    create: {
      externalAuthId: clerkUserId,
      ...(email !== undefined ? { email } : {}),
      ...(name !== undefined ? { name } : {}),
      ...(imageUrl !== undefined ? { imageUrl } : {}),
    },
  });
}

/** ---- Narrowed event helpers (types only) ---- */
type UserUpsertEvt = Extract<
  WebhookEvent,
  { type: "user.created" | "user.updated" }
>;
type SessionCreatedEvt = Extract<WebhookEvent, { type: "session.created" }>;
type UserDeletedEvt = Extract<WebhookEvent, { type: "user.deleted" }>;

/** ---- Handler ---- */
export async function POST(req: Request) {
  // 1) Verify signature with Svix using RAW body
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "missing CLERK_WEBHOOK_SECRET" },
      { status: 500 }
    );
  }

  let evt: WebhookEvent;
  try {
    const payload = await req.text();
    const svixHeaders = {
      "svix-id": need(req.headers, "svix-id"),
      "svix-timestamp": need(req.headers, "svix-timestamp"),
      "svix-signature": need(req.headers, "svix-signature"),
    };
    evt = new Webhook(secret).verify(payload, svixHeaders) as WebhookEvent;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, error: `invalid signature: ${msg}` },
      { status: 400 }
    );
  }

  try {
    switch (evt.type) {
      case "user.created":
      case "user.updated": {
        const u = (evt as UserUpsertEvt).data as ClerkUserPayload;

        // Extract directly from event payload (works even without CLERK_SECRET_KEY)
        const email = getBestEmailFromEvent({
          primary_email_address_id: u.primary_email_address_id ?? null,
          email_addresses: u.email_addresses ?? null,
          external_accounts: u.external_accounts ?? null,
        });

        const name =
          [u.first_name, u.last_name].filter(Boolean).join(" ") ||
          u.username ||
          email ||
          null;

        const imageUrl = u.image_url ?? null;

        await upsertByClerkId(u.id, { email, name, imageUrl });
        return NextResponse.json({ ok: true, event: evt.type });
      }

      // Many apps also see session.created on first sign-in
      case "session.created": {
        const s = (evt as SessionCreatedEvt).data as ClerkSessionPayload;
        const userId = s.user_id ?? null;
        if (userId) {
          // Upsert minimally; upsertByClerkId will fetch more if adminClerk exists
          await upsertByClerkId(userId);
        }
        return NextResponse.json({ ok: true, event: evt.type });
      }

      // Keep DB in sync (soft-delete is also fine)
      case "user.deleted": {
        const uid = (evt as UserDeletedEvt).data.id;
        if (uid) {
          await prisma.user.deleteMany({ where: { externalAuthId: uid } });
        }
        return NextResponse.json({ ok: true, event: evt.type });
      }

      default:
        // Ignore events you don't care about
        return NextResponse.json({ ok: true, ignored: evt.type });
    }
  } catch (e) {
    console.error("Webhook DB error:", e);
    return NextResponse.json({ ok: false, error: "db error" }, { status: 500 });
  }
}

// Optional: block other methods
export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
