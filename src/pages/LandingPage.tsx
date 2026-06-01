import { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { HowToUse } from "../components/HowToUse3";
import { SuccessStories } from "../components/SuccessStories2";
import { ActorCards } from "../components/ActorCards";
import { Footer } from "../components/Footer";
import { CtaSection } from "../components/CtaSection";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Testimonials } from "../components/Testimonials";
import { ContactModal } from "../components/ContactModal";

export function LandingPage() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    // Refresh ScrollTrigger after a short delay to account for any layout shifts
    // from pinning or image loading.
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col w-full selection:bg-brand-green/20 selection:text-brand-text no-scrollbar">
      {/* 1. Header & Navigation */}
      <Navbar
        onContactClick={() => setIsContactModalOpen(true)}
        logoSrc="/Logo%20green.png"
        logoAlt="NoThrowam green logo"
        hideLogoText
      />

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
      <CtaSection onContactClick={() => setIsContactModalOpen(true)} />
      <Footer />

      {/* Global Modals */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  );
}
