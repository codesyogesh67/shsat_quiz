import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const dbUser = await getCurrentUser();

    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const preferences = await prisma.userPreferences.findUnique({
      where: {
        userId: dbUser.id,
      },
    });

    return NextResponse.json({
      preferences: preferences ?? {
        parentSummaryEmail: false,
        parentEmail: "",
        billingEmail: "",
      },
    });
  } catch (error) {
    console.error("GET /api/profile/preferences error", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load preferences",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const dbUser = await getCurrentUser();

    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const parentSummaryEmail =
      typeof body.parentSummaryEmail === "boolean"
        ? body.parentSummaryEmail
        : false;

    const parentEmail =
      typeof body.parentEmail === "string" ? body.parentEmail.trim() : "";

    const billingEmail =
      typeof body.billingEmail === "string" ? body.billingEmail.trim() : "";

    const preferences = await prisma.userPreferences.upsert({
      where: {
        userId: dbUser.id,
      },
      update: {
        parentSummaryEmail,
        parentEmail: parentEmail || null,
        billingEmail: billingEmail || null,
      },
      create: {
        userId: dbUser.id,
        parentSummaryEmail,
        parentEmail: parentEmail || null,
        billingEmail: billingEmail || null,
      },
    });

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error("PATCH /api/profile/preferences error", error);

    return NextResponse.json(
      { error: "Failed to save preferences" },
      { status: 500 }
    );
  }
}
