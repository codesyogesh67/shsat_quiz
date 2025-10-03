// import QuizPage from "./quiz/page";
import HeroLanding from "@/components/layout/hero-landing";
import CategoryGrid from "@/components/layout/category-grid";
import FeatureStrip from "@/components/layout/feature-strip";
// import PricingTeaser from "@/components/layout/pricing-teaser";

export default function Home() {
  return (
    <>
      <HeroLanding />
      <FeatureStrip />
      <CategoryGrid />

      {/* <div className="px-2 sm:px-4 md:px-10 lg:px-20 xl:px-28 max-w-7xl mx-auto py-10">
        <h2 className="text-center text-6xl font-bold mb-2">
          SHSAT PRACTICE GUIDE
        </h2>

        <QuizPage />
      </div> */}
      {/* <PricingTeaser /> */}
    </>
  );
}
