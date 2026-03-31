// app/sign-in/[[...sign-in]]/page.tsx
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

const highlights = [
  {
    icon: Brain,
    title: "Adaptive SHSAT practice",
    text:
      "Train smarter with category-based practice, diagnostic insights, and focused review.",
  },
  {
    icon: BarChart3,
    title: "Student progress tracking",
    text:
      "Monitor accuracy, weak topics, practice consistency, and overall readiness.",
  },
  {
    icon: Target,
    title: "Built for competitive prep",
    text:
      "A calm, structured learning space designed for serious NYC SHSAT students.",
  },
];

const metrics = [
  { label: "Focused categories", value: "20+" },
  { label: "Smart practice modes", value: "5" },
  { label: "Progress insights", value: "Live" },
];

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-2">
        {/* Left panel */}
        <section className="relative hidden overflow-hidden border-r border-slate-200/70 lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.14),transparent_28%)]" />

          <div className="relative z-10 flex w-full flex-col justify-between px-10 py-10 xl:px-14 xl:py-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm backdrop-blur">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                Premium SHSAT preparation
              </div>

              <div className="mt-10 max-w-xl">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">
                  SHSAT Guide
                </p>

                <h1 className="mt-4 text-5xl font-semibold tracking-tight text-slate-900">
                  Welcome back to your
                  <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    {" "}
                    focused study space
                  </span>
                  .
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                  Sign in to continue your SHSAT prep with structured practice,
                  student-friendly analytics, and a modern dashboard built for
                  serious improvement.
                </p>
              </div>

              <div className="mt-10 grid gap-4">
                {highlights.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="group rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-sm backdrop-blur transition-all duration-200 hover:bg-white"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition-all duration-200 group-hover:bg-indigo-50 group-hover:text-indigo-600">
                          <Icon className="h-5 w-5" />
                        </div>

                        <div>
                          <h3 className="text-base font-semibold text-slate-900">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-sm backdrop-blur"
                >
                  <div className="text-2xl font-semibold text-slate-900">
                    {metric.value}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right panel */}
        <section className="relative flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="absolute inset-0 lg:hidden bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.12),transparent_28%)]" />

          <div className="relative z-10 w-full max-w-xl">
            <div className="mb-6 lg:hidden">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                SHSAT Guide
              </div>

              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Sign in and continue your progress
              </h1>

              <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500 sm:text-base">
                Access your dashboard, review weak areas, and keep your SHSAT
                prep moving forward.
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200/70 bg-white/95 p-3 shadow-sm backdrop-blur sm:p-4">
              <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white">
                <div className="border-b border-slate-200/70 bg-slate-50/70 px-5 py-4 sm:px-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Student Sign In
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Secure access to your SHSAT Guide account.
                      </p>
                    </div>

                    <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 sm:flex">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Protected login
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <SignIn
                    routing="path"
                    path="/sign-in"
                    signUpUrl="/sign-up"
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

                  <div className="mt-6 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <TrendingUp className="h-5 w-5" />
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          Built for steady improvement
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          After sign in, students can continue practice, review
                          performance, and stay consistent with a focused study
                          workflow.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200/70 pt-4 text-sm">
                    <p className="text-slate-500">New to SHSAT Guide?</p>

                    <Link
                      href="/sign-up"
                      className="inline-flex items-center gap-1.5 font-medium text-indigo-600 transition-all duration-200 hover:text-violet-600"
                    >
                      Create account
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
