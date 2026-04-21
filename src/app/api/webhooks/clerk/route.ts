import { NextResponse } from "next/server";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { createClerkClient } from "@clerk/backend";

export const runtime = "nodejs";

/** ---- Admin Clerk client (explicit) ---- */
const adminClerk = process.env.CLERK_SECRET_KEY
  ? createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
  : null;

/** ---- Trial config ---- */
const TRIAL_DAYS = 14;

/**
 * Comma-separated list of old dev-user emails that are allowed
 * to relink their Neon row to a new production Clerk user ID.
 *
 * Example in .env:
 * DEV_USER_MIGRATION_EMAILS=user1@gmail.com,user2@gmail.com
 */
const DEV_USER_EMAIL_WHITELIST = new Set(
  (process.env.DEV_USER_MIGRATION_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
);

/** ---- Helpers ---- */
function need(h: Headers, key: string) {
  const v = h.get(key);
  if (!v) throw new Error(`Missing header: ${key}`);
  return v;
}

function getTrialEndDate(start: Date) {
  return new Date(start.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
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

interface ClerkUserDeletedPayload {
  id: string;
}

/** ---- Helper for resilient narrowing ---- */
type Narrowed<TType extends string, TData> = Extract<
  WebhookEvent,
  { type: TType }
> extends never
  ? { type: TType; data: TData }
  : Extract<WebhookEvent, { type: TType }>;

/** ---- Event specializations ---- */
type UserCreatedEvt = Narrowed<"user.created", ClerkUserPayload>;
type UserUpdatedEvt = Narrowed<"user.updated", ClerkUserPayload>;
type UserUpsertEvt = UserCreatedEvt | UserUpdatedEvt;

type SessionCreatedEvt = Narrowed<"session.created", ClerkSessionPayload>;
type UserDeletedEvt = Narrowed<"user.deleted", ClerkUserDeletedPayload>;

/** ---- Email selection helper ---- */
function getBestEmailFromEvent(u: {
  primary_email_address_id?: string | null;
  email_addresses?: ClerkEmailAddress[] | null;
  external_accounts?: ClerkExternalAccount[] | null;
}) {
  // 1) Primary email
  if (u.primary_email_address_id && u.email_addresses?.length) {
    const primary = u.email_addresses.find(
      (e) => e.id === u.primary_email_address_id
    );
    if (primary?.email_address) return primary.email_address.toLowerCase();
  }

  // 2) First verified email
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

/** ---- DB upsert / relink ---- */
async function upsertByClerkId(
  clerkUserId: string,
  opts?: {
    email?: string | null;
    name?: string | null;
    imageUrl?: string | null;
  }
) {
  let email = opts?.email?.toLowerCase() ?? null;
  let name = opts?.name ?? null;
  let imageUrl = opts?.imageUrl ?? null;

  // Last-resort: fetch from Clerk only if we have an admin client
  if ((!email || !name || !imageUrl) && adminClerk) {
    try {
      const c = await adminClerk.users.getUser(clerkUserId);

      email =
        email ??
        c.primaryEmailAddress?.emailAddress?.toLowerCase() ??
        c.emailAddresses[0]?.emailAddress?.toLowerCase() ??
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

  const now = new Date();
  const defaultTrialEndsAt = getTrialEndDate(now);

  // 1) Normal path: existing user already linked to this Clerk user ID
  const existingByClerkId = await prisma.user.findUnique({
    where: { externalAuthId: clerkUserId },
  });

  if (existingByClerkId) {
    return prisma.user.update({
      where: { id: existingByClerkId.id },
      data: {
        ...(email ? { email } : {}),
        ...(name ? { name } : {}),
        ...(imageUrl ? { imageUrl } : {}),

        // Backfill missing trial fields for older rows
        ...(existingByClerkId.planType === "TRIAL" &&
        !existingByClerkId.trialStartedAt
          ? { trialStartedAt: now }
          : {}),
        ...(existingByClerkId.planType === "TRIAL" &&
        !existingByClerkId.trialEndsAt
          ? { trialEndsAt: defaultTrialEndsAt }
          : {}),
      },
    });
  }

  // 2) Migration path: relink old dev users to new production Clerk ID by email
  if (email && DEV_USER_EMAIL_WHITELIST.has(email)) {
    const existingByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingByEmail) {
      return prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          externalAuthId: clerkUserId,
          ...(name ? { name } : {}),
          ...(imageUrl ? { imageUrl } : {}),

          // Backfill missing trial fields for older rows
          ...(existingByEmail.planType === "TRIAL" &&
          !existingByEmail.trialStartedAt
            ? { trialStartedAt: now }
            : {}),
          ...(existingByEmail.planType === "TRIAL" &&
          !existingByEmail.trialEndsAt
            ? { trialEndsAt: defaultTrialEndsAt }
            : {}),
        },
      });
    }
  }

  // 3) Brand-new user
  return prisma.user.create({
    data: {
      externalAuthId: clerkUserId,
      ...(email ? { email } : {}),
      ...(name ? { name } : {}),
      ...(imageUrl ? { imageUrl } : {}),
      planType: "TRIAL",
      trialStartedAt: now,
      trialEndsAt: defaultTrialEndsAt,
    },
  });
}

/** ---- Handler ---- */
export async function POST(req: Request) {
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
        const u = (evt as UserUpsertEvt).data;

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

      case "session.created": {
        const s = (evt as SessionCreatedEvt).data;
        const userId = s.user_id ?? null;

        if (userId) {
          await upsertByClerkId(userId);
        }

        return NextResponse.json({ ok: true, event: evt.type });
      }

      case "user.deleted": {
        const uid = (evt as UserDeletedEvt).data.id;

        if (uid) {
          await prisma.user.deleteMany({
            where: { externalAuthId: uid },
          });
        }

        return NextResponse.json({ ok: true, event: evt.type });
      }

      default:
        return NextResponse.json({ ok: true, ignored: evt.type });
    }
  } catch (e) {
    console.error("Webhook DB error:", e);
    return NextResponse.json({ ok: false, error: "db error" }, { status: 500 });
  }
}

/** ---- Optional: block other methods ---- */
export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
