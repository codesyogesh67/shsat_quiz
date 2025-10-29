import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SHSAT Math Practice App",
  description:
    "Practice SHSAT math questions with detailed solutions, timed quizzes, and progress tracking. Perfect for NYC students preparing for the Specialized High Schools Admissions Test.",
  keywords: [
    "SHSAT",
    "SHSAT practice",
    "SHSAT math",
    "NYC specialized high schools",
    "test prep",
    "math practice questions",
  ],
  authors: [{ name: "" }],
  openGraph: {
    title: "SHSAT Math Practice App",
    description:
      "Timed SHSAT math practice with progress tracking and explanations. Get ready for the NYC Specialized High Schools Admissions Test.",
    url: "https://shsatmathny.com",
    siteName: "SHSAT Math Practice App",
    images: [
      {
        url:
          "https://og-playground.vercel.app/?share=XZJNb8IwDIb_SmQ0cWGQQSkjAqSNTWIHTiDt0kshaRuWNlWb8lX1v89pV8Q41XleO29st4S95gIYzLg8egkhubkoMS9LGxMSCRlGhpHuC6VP3V4DT5Kb6IFxmafKvyANlDi31MYfMhN7I3WC2l6rIk5a1VcyTL6MiHMricSIrJUORW5kcFlqhIn1_y_v_P1PmOki4UutdIZ6JwiCmytWbeRVMDIa3qHvv15cSmtaVV6ysMEsP4Z3nc09mIw9aMhRitO7PiOjhJLJmLg3KZBKIe9QSlvUDo_EfhZK27GtSc_d2oyQ2g4NU99EhGPxejTpj6f94ViN3P4Ub3dWfddpDs-uc_VgMRvY7OahA3xpE-G2Ht22OmXEoWi12Kw2b1uyxrrZADOxpP1CD3Rqt5EDK6HuF9grTgSaVQNz7IGLXRECC3yVix6IWB_k9pLa_8Sc6hPeY2f6Ge8EB2ayQlQ9MP4OMyKhlD7pTHGofgE",
        width: 1200,
        height: 630,
        alt: "SHSAT Math Practice App Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SHSAT Math Practice App",
    description:
      "Practice SHSAT math questions online with timed quizzes and instant feedback.",
    images: [
      "https://og-playground.vercel.app/?share=XZJNb8IwDIb_SmQ0cWGQQSkjAqSNTWIHTiDt0kshaRuWNlWb8lX1v89pV8Q41XleO29st4S95gIYzLg8egkhubkoMS9LGxMSCRlGhpHuC6VP3V4DT5Kb6IFxmafKvyANlDi31MYfMhN7I3WC2l6rIk5a1VcyTL6MiHMricSIrJUORW5kcFlqhIn1_y_v_P1PmOki4UutdIZ6JwiCmytWbeRVMDIa3qHvv15cSmtaVV6ysMEsP4Z3nc09mIw9aMhRitO7PiOjhJLJmLg3KZBKIe9QSlvUDo_EfhZK27GtSc_d2oyQ2g4NU99EhGPxejTpj6f94ViN3P4Ub3dWfddpDs-uc_VgMRvY7OahA3xpE-G2Ht22OmXEoWi12Kw2b1uyxrrZADOxpP1CD3Rqt5EDK6HuF9grTgSaVQNz7IGLXRECC3yVix6IWB_k9pLa_8Sc6hPeY2f6Ge8EB2ayQlQ9MP4OMyKhlD7pTHGofgE",
    ],
  },
  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      <html lang="en">
        <body
          id="top"
          className="min-h-screen bg-background text-foreground antialiased"
        >
          <Navbar />
          <main>{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
