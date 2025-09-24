// app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <SignUp afterSignUpUrl="/dashboard" signInUrl="/sign-in" />
    </div>
  );
}
