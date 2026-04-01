import { useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { HowToUse } from "../components/HowToUse2";
import { SuccessStories } from "../components/SuccessStories";
import { ActorCards } from "../components/ActorCards";
import { Footer } from "../components/Footer";
import { CtaSection } from "../components/CtaSection";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Testimonials } from "../components/Testimonials";

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
      <main data-nav-bg="" className="grow">
        {/* 2. Hero Section (Guest Flow) */}
        <Hero data-nav-bg="bg-[#004d3a]" />

        {/* 3. How To Use (Scroll Animation) */}
        <HowToUse data-nav-bg="bg-[#004d3a]" />

        {/* 4. Promotional & Advertisement Section */}
        <SuccessStories />

        {/* 4. Actor Entry Points (Call to Action) */}
        <ActorCards />
      </main>

      {/* Standard Footer */}
      <Testimonials />
      <CtaSection />
      <Footer />
    </div>
  );
}
