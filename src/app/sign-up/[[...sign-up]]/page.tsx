// app/sign-up/[[...sign-up]]/page.tsx
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import {
  ArrowRight,
  BookMarked,
  Brain,
  CalendarDays,
  CheckCircle2,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";

const benefits = [
  "Start with a cleaner, more focused SHSAT practice experience.",
  "Track strengths, weak areas, and improvement over time.",
  "Build momentum with a student-friendly premium dashboard.",
];

const steps = [
  {
    icon: BookMarked,
    title: "Take diagnostic practice",
    text: "Get an early picture of where you stand and what needs improvement.",
  },
  {
    icon: Brain,
    title: "Practice by category",
    text: "Study algebra, geometry, grammar, reading, and more with intention.",
  },
  {
    icon: Trophy,
    title: "Improve with confidence",
    text:
      "Use your dashboard to stay consistent and prepare like a serious student.",
  },
];

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left content */}
        <section className="relative flex items-center px-4 py-10 sm:px-6 lg:px-10 xl:px-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.12),transparent_30%)]" />

          <div className="relative z-10 mx-auto w-full max-w-2xl lg:mx-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/85 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              Education-focused premium platform
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Create your account and start a
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                {" "}
                more intentional SHSAT journey
              </span>
              .
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              SHSAT Guide helps students practice with structure, improve weak
              areas, and prepare with a clean dashboard experience designed for
              serious progress.
            </p>

            <div className="mt-8 grid gap-3">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/85 p-4 shadow-sm backdrop-blur"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <p className="text-sm leading-6 text-slate-600 sm:text-base">
                    {benefit}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {steps.map((step) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.title}
                    className="rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-sm backdrop-blur transition-all duration-200 hover:bg-white"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="mt-4 text-base font-semibold text-slate-900">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {step.text}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white px-3 py-1.5 shadow-sm">
                <Star className="h-4 w-4 text-fuchsia-500" />
                Student-friendly experience
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white px-3 py-1.5 shadow-sm">
                <CalendarDays className="h-4 w-4 text-indigo-600" />
                Designed for daily consistency
              </div>
            </div>
          </div>
        </section>

        {/* Right form */}
        <section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200/70 bg-white/95 p-3 shadow-sm backdrop-blur sm:p-4">
            <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white">
              <div className="border-b border-slate-200/70 bg-slate-50/70 px-5 py-4 sm:px-6">
                <p className="text-sm font-semibold text-slate-900">
                  Create your student account
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Join SHSAT Guide and begin with a clean, structured prep
                  experience.
                </p>
              </div>

              <div className="p-4 sm:p-6">
                <SignUp
                  routing="path"
                  path="/sign-up"
                  signInUrl="/sign-in"
                  fallbackRedirectUrl="/dashboard"
                  appearance={{
                    layout: {
                      socialButtonsPlacement: "top",
                      socialButtonsVariant: "blockButton",
                      showOptionalFields: false,
                      shimmer: false,
                    },
                    elements: {
                      rootBox: "w-full",
                      card: "w-full shadow-none border-0 bg-transparent",
                      header: "hidden",
                      footer: "hidden",
                      form: "gap-5",
                      formFieldRow: "gap-2",
                      formFieldLabel:
                        "text-sm font-medium text-slate-700 mb-1.5",
                      formFieldInput:
                        "h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 shadow-none transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-0 focus:shadow-none",
                      formButtonPrimary:
                        "h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 transition-all duration-200 hover:opacity-95",
                      socialButtonsBlockButton:
                        "h-11 rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-sm",
                      socialButtonsBlockButtonText:
                        "font-medium text-slate-700",
                      dividerLine: "bg-slate-200",
                      dividerText:
                        "text-xs uppercase tracking-[0.18em] text-slate-400",
                      footerActionText: "text-slate-500",
                      footerActionLink:
                        "font-medium text-indigo-600 hover:text-violet-600",
                      identityPreviewText: "text-slate-600",
                      identityPreviewEditButton:
                        "text-indigo-600 hover:text-violet-600",
                      formResendCodeLink:
                        "font-medium text-indigo-600 hover:text-violet-600",
                      otpCodeFieldInput:
                        "h-11 rounded-xl border border-slate-200 bg-white text-slate-900 shadow-none focus:border-indigo-500 focus:ring-0",
                      alert:
                        "rounded-xl border border-amber-200 bg-amber-50 text-amber-700",
                      formFieldSuccessText: "text-emerald-600",
                      formFieldWarningText: "text-amber-600",
                      formFieldErrorText: "text-rose-600",
                      otpCodeFieldInputBox:
                        "rounded-xl border border-slate-200",
                    },
                  }}
                />

                <div className="mt-6 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Why students join
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Clear structure, focused category practice, and a dashboard
                    experience that supports steady academic improvement.
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200/70 pt-4 text-sm">
                  <p className="text-slate-500">Already have an account?</p>

                  <Link
                    href="/sign-in"
                    className="inline-flex items-center gap-1.5 font-medium text-indigo-600 transition-all duration-200 hover:text-violet-600"
                  >
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
