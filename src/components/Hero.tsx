import { Megaphone, MapPin } from "lucide-react";
import { landingData } from "../constants/landingData";

export function Hero() {
  const handleReportWaste = () => {
    // Scaffold functionality for later Implementation (e.g. tracking pos)
    console.log("Triggering Report Waste Flow...");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => console.log("Position:", position.coords),
        (error) => console.log("Geolocation error:", error),
      );
    }
  };

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden bg-brand-green text-white"
    >
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-multiply">
        <img
          src={landingData.hero.imageUrl}
          alt={landingData.hero.imageCaption}
          className="w-full h-full object-cover object-center"
          loading="lazy"
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 lg:py-40">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-brand-yellow/90 backdrop-blur-sm text-brand-text font-bold px-4 py-1.5 rounded-full text-sm mb-6 shadow-sm">
            <MapPin size={16} /> Welcome to the NoThrowan Initiative
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6 text-shadow-sm">
            {landingData.hero.title.en}
          </h1>

          <p className="text-xl sm:text-2xl font-medium text-white/90 mb-2">
            {landingData.hero.title.fr}
          </p>

          <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl">
            {landingData.hero.subtitle.en} <br />
            <span className="text-base opacity-80">
              {landingData.hero.subtitle.fr}
            </span>
          </p>

          <button
            onClick={handleReportWaste}
            className="flex items-center gap-3 bg-brand-red hover:bg-[#a10e1e] text-white px-8 py-5 rounded-full text-xl sm:text-2xl font-bold shadow-xl hover:shadow-2xl transition-all transform active:scale-95 focus:ring-4 focus:ring-white/30"
          >
            <Megaphone className="h-6 w-6 sm:h-8 sm:w-8" />
            <span>
              {landingData.hero.ctaText.en} | {landingData.hero.ctaText.fr}
            </span>
          </button>
        </div>
      </div>

      {/* Curved Shape Divider at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20">
        <svg
          className="relative block w-full h-[50px] md:h-[100px]"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,121.32,196.36,108.6,239.3,100,281.45,80.6,321.39,56.44Z"
            className="fill-brand-surface"
          ></path>
        </svg>
      </div>
    </section>
  );
}
