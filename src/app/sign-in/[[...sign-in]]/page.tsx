// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <SignIn afterSignInUrl="/dashboard" signUpUrl="/sign-up" />
    </div>
  );
}
