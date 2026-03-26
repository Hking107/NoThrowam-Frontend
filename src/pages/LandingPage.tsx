//import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { HowToUse } from "../components/HowToUse";
import { SuccessStories } from "../components/SuccessStories";
import { ActorCards } from "../components/ActorCards";
import { Footer } from "../components/Footer";
import { CtaSection } from "../components/CtaSection";

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col w-full selection:bg-brand-green/20 selection:text-brand-text">
      {/* <Navbar /> */}

      <main className="grow">
        <Hero />

        <SuccessStories />
        <ActorCards />
      </main>

      <CtaSection />
      <Footer />
    </div>
  );
}
