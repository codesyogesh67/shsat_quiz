"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SignOutButton, useUser } from "@clerk/nextjs";
import {
  BadgeCheck,
  Crown,
  Loader2,
  Mail,
  Shield,
  Sparkles,
  User2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type PreferencesResponse = {
  preferences: {
    parentSummaryEmail: boolean;
    parentEmail: string | null;
    billingEmail: string | null;
  };
};

type ProfilePageClientProps = {
  access: {
    planType: "FREE" | "TRIAL" | "PREMIUM";
    isPremium: boolean;
    isTrialActive: boolean;
    trialDaysLeft: number;
    premiumEndsAt: Date | null;
    trialEndsAt: Date | null;
  };
};

export default function ProfilePageClient({ access }: ProfilePageClientProps) {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [parentEmail, setParentEmail] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [parentSummaryEmail, setParentSummaryEmail] = useState(false);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [isLoadingContact, setIsLoadingContact] = useState(true);

  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [contactMessage, setContactMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
  }, [user]);

  useEffect(() => {
    async function loadContactSettings() {
      try {
        setIsLoadingContact(true);
        setContactMessage(null);

        const res = await fetch("/api/profile/preferences", {
          method: "GET",
          cache: "no-store",
        });

        const data:
          | PreferencesResponse
          | { error?: string }
          | null = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(
            (data && "error" in data && data.error) ||
              "Failed to load contact settings"
          );
        }

        if (!data || !("preferences" in data)) {
          throw new Error("Invalid contact settings response");
        }

        setParentSummaryEmail(Boolean(data.preferences.parentSummaryEmail));
        setParentEmail(data.preferences.parentEmail ?? "");
        setBillingEmail(data.preferences.billingEmail ?? "");
      } catch (error) {
        console.error("loadContactSettings error:", error);

        setContactMessage(
          error instanceof Error
            ? error.message
            : "We could not load your saved contact settings."
        );
      } finally {
        setIsLoadingContact(false);
      }
    }

    if (isLoaded && user) {
      void loadContactSettings();
    }
  }, [isLoaded, user]);

  if (!isLoaded) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">
        <Card className="rounded-[28px] border-slate-200/70 bg-white shadow-sm">
          <CardContent className="flex min-h-[260px] items-center justify-center">
            <div className="flex items-center gap-3 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading profile...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) return null;

  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.username ||
    "Student";

  const primaryEmail =
    user.primaryEmailAddress?.emailAddress ?? "No email found";

  const initials =
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.trim() ||
    user.username?.[0]?.toUpperCase() ||
    "S";

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "—";

  const planLabel =
    access.planType === "PREMIUM"
      ? "Premium Plan"
      : access.planType === "TRIAL"
      ? "Trial Plan"
      : "Free Plan";

  const planBadgeLabel = access.isPremium
    ? "Full Access"
    : access.isTrialActive
    ? "Trial Active"
    : access.planType === "TRIAL"
    ? "Trial Ended"
    : "Limited Access";

  const parentUpdatesLabel = parentSummaryEmail ? "Enabled" : "Off";

  const trialEndLabel = access.trialEndsAt
    ? new Date(access.trialEndsAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const premiumEndLabel = access.premiumEndsAt
    ? new Date(access.premiumEndsAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const planDescription = access.isPremium
    ? "You already have full access to premium study tools, deeper analytics, and detailed review."
    : access.isTrialActive
    ? `Your free trial is active with ${access.trialDaysLeft} day${
        access.trialDaysLeft === 1 ? "" : "s"
      } left.`
    : access.planType === "TRIAL"
    ? trialEndLabel
      ? `Your free trial has ended. It expired on ${trialEndLabel}. Upgrade to continue with full access.`
      : "Your account is on the trial plan. Add or verify a trial end date to show the remaining trial period."
    : "Upgrade to unlock premium practice flows, deeper analytics, and a stronger parent-facing experience.";

  async function handleSaveProfile() {
    if (!user) {
      setProfileMessage("User not found. Please refresh and try again.");
      return;
    }

    try {
      setIsSavingProfile(true);
      setProfileMessage(null);

      await user.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      await user.reload();
      setProfileMessage("Profile updated successfully.");
    } catch (error) {
      console.error(error);
      setProfileMessage(
        "We could not update your profile. Make sure first and last name are enabled in Clerk."
      );
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleSaveContact() {
    try {
      setIsSavingContact(true);
      setContactMessage(null);

      const res = await fetch("/api/profile/preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parentSummaryEmail,
          parentEmail,
          billingEmail,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save contact settings");
      }

      setContactMessage("Contact settings saved successfully.");
    } catch (error) {
      console.error(error);
      setContactMessage("We could not save your contact settings.");
    } finally {
      setIsSavingContact(false);
    }
  }

  function handleUpgrade() {
    router.push("/pricing");
  }

  function handleViewPlans() {
    router.push("/pricing");
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 md:px-6">
      <section className="relative overflow-hidden rounded-[32px] border border-slate-200/70 bg-gradient-to-br from-white via-white to-indigo-50/70 shadow-sm">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.12),transparent_30%)]" />

        <div className="relative flex flex-col gap-6 p-6 md:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={fullName}
                className="h-16 w-16 rounded-2xl border border-slate-200 object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-xl font-semibold text-white shadow-lg shadow-indigo-500/20">
                {initials.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                  {fullName}
                </h1>

                <Badge className="rounded-full border-0 bg-emerald-50 px-2.5 py-1 text-emerald-700">
                  <BadgeCheck className="mr-1 h-3.5 w-3.5" />
                  Active Student
                </Badge>
              </div>

              <p className="max-w-2xl text-sm leading-6 text-slate-600">
                Manage your profile, parent contact, billing contact, and
                account access in one premium workspace.
              </p>

              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 shadow-sm">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {primaryEmail}
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 shadow-sm">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  Member since {memberSince}
                </div>
              </div>
            </div>
          </div>

          <div className="grid w-full max-w-sm grid-cols-2 gap-3">
            <HeroStat label="Plan" value={planLabel} />
            <HeroStat label="Parent Updates" value={parentUpdatesLabel} />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card className="rounded-[32px] border-slate-200/70 bg-white shadow-sm">
            <CardContent className="p-0">
              <SectionHeader
                icon={
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <User2 className="h-5 w-5" />
                  </div>
                }
                title="Profile Details"
                description="Update the student name shown across your account."
              />

              <div className="space-y-6 p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="First name"
                    value={firstName}
                    onChange={setFirstName}
                    placeholder="First name"
                  />
                  <FormField
                    label="Last name"
                    value={lastName}
                    onChange={setLastName}
                    placeholder="Last name"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 text-white shadow-md shadow-indigo-500/20 hover:opacity-95 disabled:opacity-70"
                  >
                    {isSavingProfile ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Profile"
                    )}
                  </Button>

                  {profileMessage ? (
                    <p className="text-sm text-slate-500">{profileMessage}</p>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-slate-200/70 bg-white shadow-sm">
            <CardContent className="p-0">
              <SectionHeader
                icon={
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <Mail className="h-5 w-5" />
                  </div>
                }
                title="Parent & Billing Contact"
                description="Keep parent communication and future billing details organized."
              />

              <div className="space-y-6 p-6">
                {isLoadingContact ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading your saved contact settings...
                  </div>
                ) : null}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Login Email
                  </label>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-900">
                      {primaryEmail}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="Parent Email"
                    value={parentEmail}
                    onChange={setParentEmail}
                    placeholder="parent@example.com"
                  />
                  <FormField
                    label="Billing Email"
                    value={billingEmail}
                    onChange={setBillingEmail}
                    placeholder="billing@example.com"
                  />
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={parentSummaryEmail}
                      onChange={(e) => setParentSummaryEmail(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Weekly parent progress emails
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Send future progress summaries to the parent email.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    onClick={handleSaveContact}
                    disabled={isSavingContact || isLoadingContact}
                    className="h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 text-white shadow-md shadow-indigo-500/20 hover:opacity-95 disabled:opacity-70"
                  >
                    {isSavingContact ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Contact Settings"
                    )}
                  </Button>

                  {contactMessage ? (
                    <p className="text-sm text-slate-500">{contactMessage}</p>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden rounded-[32px] border-slate-200/70 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 shadow-sm">
            <CardContent className="p-0">
              <div className="p-6 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                      <Crown className="h-6 w-6 text-yellow-300" />
                    </div>

                    <div>
                      <p className="text-sm text-slate-300">Membership</p>
                      <h2 className="text-xl font-semibold">{planLabel}</h2>
                    </div>
                  </div>

                  <Badge className="rounded-full border-0 bg-white/10 text-slate-100">
                    {planBadgeLabel}
                  </Badge>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-300">
                  {planDescription}
                </p>

                {access.isPremium ? (
                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-medium text-white">
                      Premium access is active
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      Your dashboard, detailed review, and premium learning
                      tools are unlocked.
                    </p>

                    {premiumEndLabel ? (
                      <p className="mt-3 text-xs text-slate-400">
                        Access valid until {premiumEndLabel}
                      </p>
                    ) : null}
                  </div>
                ) : access.planType === "TRIAL" ? (
                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-medium text-white">
                      {access.isTrialActive
                        ? "Trial access is active"
                        : "Trial plan status"}
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      {access.isTrialActive
                        ? `Your trial gives you temporary access to premium features with ${
                            access.trialDaysLeft
                          } day${
                            access.trialDaysLeft === 1 ? "" : "s"
                          } remaining.`
                        : "Your account is marked as a trial plan, but the trial is not currently active."}
                    </p>

                    {trialEndLabel ? (
                      <p className="mt-3 text-xs text-slate-400">
                        Trial {access.isTrialActive ? "ends" : "ended"} on{" "}
                        {trialEndLabel}
                      </p>
                    ) : (
                      <p className="mt-3 text-xs text-slate-400">
                        No trial end date is set yet.
                      </p>
                    )}

                    <Button
                      type="button"
                      onClick={handleViewPlans}
                      variant="ghost"
                      className="mt-4 h-11 w-full rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10"
                    >
                      View Plans
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button
                      type="button"
                      onClick={handleUpgrade}
                      className="mt-6 h-12 w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-950/30 hover:opacity-95"
                    >
                      Upgrade to Premium
                    </Button>

                    <Button
                      type="button"
                      onClick={handleViewPlans}
                      variant="ghost"
                      className="mt-3 h-11 w-full rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10"
                    >
                      View Plans
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border-slate-200/70 bg-white shadow-sm">
            <CardContent className="p-0">
              <SectionHeader
                icon={
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <Shield className="h-5 w-5" />
                  </div>
                }
                title="Account Access"
                description="Simple access controls for your current account."
              />

              <div className="space-y-4 p-6">
                <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-sm font-medium text-slate-900">
                    Sign-in method
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Google account authentication
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-sm font-medium text-slate-900">
                    Current email
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{primaryEmail}</p>
                </div>

                <SignOutButton redirectUrl="/">
                  <Button
                    type="button"
                    className="h-12 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 hover:opacity-95"
                  >
                    Sign Out
                  </Button>
                </SignOutButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-slate-100 px-6 py-5">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm backdrop-blur">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 rounded-2xl border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-indigo-500"
      />
    </div>
  );
}
