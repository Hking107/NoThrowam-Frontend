//import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { SuccessStories } from "../components/SuccessStories";
import { ActorCards } from "../components/ActorCards";
import { Footer } from "../components/Footer";
import { CtaSection } from "../components/CtaSection";

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col w-full selection:bg-brand-green/20 selection:text-brand-text">
      {/* 1. Header & Navigation */}
      {/* <Navbar /> */}

      {/* Main Content Area */}
      <main className="grow">
        {/* 2. Hero Section (Guest Flow) */}
        <Hero />

        {/* 3. Promotional & Advertisement Section */}
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
