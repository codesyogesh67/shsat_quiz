import type { User } from "@prisma/client";

export type AppPlanType = "FREE" | "TRIAL" | "PREMIUM";

export type UserAccess = {
  planType: AppPlanType;
  isTrial: boolean;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  isPremium: boolean;
  hasFullAccess: boolean;

  canPractice: boolean;
  canUseQuickReview: boolean;
  canUseDashboard: boolean;
  canUseDetailedReview: boolean;

  trialDaysLeft: number;
  trialEndsAt: Date | null;
  premiumEndsAt: Date | null;
};

type AccessUser =
  | Pick<
      User,
      | "planType"
      | "trialStartedAt"
      | "trialEndsAt"
      | "premiumStartedAt"
      | "premiumEndsAt"
    >
  | null
  | undefined;

function ceilDaysLeft(endDate: Date, now: Date) {
  const diff = endDate.getTime() - now.getTime();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getUserAccess(user: AccessUser): UserAccess {
  const now = new Date();

  if (!user) {
    return {
      planType: "FREE",
      isTrial: false,
      isTrialActive: false,
      isTrialExpired: false,
      isPremium: false,
      hasFullAccess: false,

      canPractice: true,
      canUseQuickReview: true,
      canUseDashboard: false,
      canUseDetailedReview: false,

      trialDaysLeft: 0,
      trialEndsAt: null,
      premiumEndsAt: null,
    };
  }

  const planType = (user.planType ?? "FREE") as AppPlanType;
  const trialEndsAt = user.trialEndsAt ?? null;
  const premiumEndsAt = user.premiumEndsAt ?? null;

  const isTrial = planType === "TRIAL";

  const isTrialActive =
    isTrial && !!trialEndsAt && trialEndsAt.getTime() > now.getTime();

  const isTrialExpired =
    isTrial && (!!trialEndsAt ? trialEndsAt.getTime() <= now.getTime() : true);

  const isPremium =
    planType === "PREMIUM" &&
    (!premiumEndsAt || premiumEndsAt.getTime() > now.getTime());

  const hasFullAccess = isTrialActive || isPremium;

  return {
    planType,
    isTrial,
    isTrialActive,
    isTrialExpired,
    isPremium,
    hasFullAccess,

    canPractice: true,
    canUseQuickReview: true,
    canUseDashboard: hasFullAccess,
    canUseDetailedReview: hasFullAccess,

    trialDaysLeft: trialEndsAt ? ceilDaysLeft(trialEndsAt, now) : 0,
    trialEndsAt,
    premiumEndsAt,
  };
}
