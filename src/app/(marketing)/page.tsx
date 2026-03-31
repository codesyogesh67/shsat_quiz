import HeroLanding from "@/components/layout/hero-landing";
import LandingStatsStrip from "@/components/layout/landing-stats-strip";
import LandingHowItWorks from "@/components/layout/landing-how-it-works";
import LandingDashboardPreview from "@/components/layout/landing-dashboard-preview";
import LandingParentSection from "@/components/layout/landing-parent-section";
import LandingCta from "@/components/layout/landing-cta";
import Footer from "@/components/layout/footer";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <HeroLanding />

      <LandingCta />
      <LandingHowItWorks />
      <LandingDashboardPreview />
      <LandingParentSection />

      <Footer />
    </main>
  );
}
