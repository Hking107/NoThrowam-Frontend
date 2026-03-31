import { useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { HowToUse } from "../components/HowToUse";
import { SuccessStories } from "../components/SuccessStories";
import { ActorCards } from "../components/ActorCards";
import { Footer } from "../components/Footer";
import { CtaSection } from "../components/CtaSection";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function LandingPage() {
  useEffect(() => {
    // Refresh ScrollTrigger after a short delay to account for any layout shifts
    // from pinning or image loading.
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col w-full selection:bg-brand-green/20 selection:text-brand-text">
      {/* 1. Header & Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="grow">
        {/* 2. Hero Section (Guest Flow) */}
        <Hero />

        {/* 3. How To Use (Scroll Animation) */}
        <HowToUse />

        {/* 4. Promotional & Advertisement Section */}
        <SuccessStories />

        {/* 4. Actor Entry Points (Call to Action) */}
        <ActorCards />
      </main>

      {/* Standard Footer */}
      <CtaSection />
      <Footer />
    </div>
  );
}
