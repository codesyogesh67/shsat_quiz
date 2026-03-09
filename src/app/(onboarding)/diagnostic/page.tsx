// app/(onboarding)/diagnostic/page.tsx
import { startDiagnostic } from "./actions";

export default function DiagnosticStartPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">Day-1 Math Diagnostic</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Timed, SHSAT-style. No fluff. We’ll use your results to generate your
        weekly focus plan.
      </p>

      <div className="mt-6 grid gap-4">
        {/* Full */}
        <form action={startDiagnostic}>
          <input type="hidden" name="variant" value="full" />
          <button className="w-full rounded-lg bg-black px-4 py-3 text-white">
            Full Diagnostic — 57 Questions · 90 Minutes
          </button>
          <p className="mt-2 text-xs text-muted-foreground">
            Closest to the real SHSAT Math experience.
          </p>
        </form>

        {/* Quick */}
        <form action={startDiagnostic}>
          <input type="hidden" name="variant" value="quick" />
          <button className="w-full rounded-lg border px-4 py-3">
            Quick Diagnostic — 20 Questions · ~32 Minutes
          </button>
          <p className="mt-2 text-xs text-muted-foreground">
            Faster onboarding. Still covers every category.
          </p>
        </form>
      </div>

      <div className="mt-6 rounded-lg border p-4 text-sm">
        <div className="font-medium">Categories covered</div>
        <ul className="mt-2 list-disc pl-5 text-muted-foreground">
          <li>Algebra</li>
          <li>Arithmetic</li>
          <li>Geometry</li>
          <li>Probability and Statistics</li>
          <li>Practice_set_1</li>
        </ul>
      </div>
    </div>
  );
}
