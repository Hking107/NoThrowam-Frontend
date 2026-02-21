import {
  Megaphone,
  MapPin,
  Recycle,
  Users,
  Leaf,
  ArrowRight,
} from "lucide-react";
import { landingData } from "../constants/landingData";

//TODO: Change the statistics of the card. To make sure that it corresponds to the project specs

const stats = [
  {
    icon: Recycle,
    value: "12,000+",
    label: "Kg Collected",
    color: "text-brand-green",
    bg: "bg-brand-green/10",
  },
  {
    icon: Users,
    value: "3,500+",
    label: "Active Members",
    color: "text-brand-yellow",
    bg: "bg-brand-yellow/20",
  },
  {
    icon: Leaf,
    value: "8",
    label: "Cities Covered",
    color: "text-brand-red",
    bg: "bg-brand-red/10",
  },
];

export function Hero() {
  const handleReportWaste = () => {
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
      className="relative w-full min-h-screen overflow-hidden bg-linear-to-br from-[#004d3a] via-brand-green to-[#009e72]"
    >
      {/* Subtle background texture / gradient blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-brand-yellow/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-black/10 blur-3xl" />
      </div>

      {/* Two-column grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-28 md:py-32">
        {/* ── LEFT: Text & CTAs ── */}
        <div className="flex flex-col items-start text-white">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-yellow/90 backdrop-blur-sm text-brand-text font-bold px-4 py-1.5 rounded-full text-sm mb-8 shadow-sm">
            <MapPin size={15} />
            Welcome to the NoThrowam Initiative
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-3">
            {landingData.hero.title.en}
          </h1>
          <p className="text-lg sm:text-xl font-medium text-white/60 italic mb-6">
            {landingData.hero.title.fr}
          </p>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-white/80 mb-10 max-w-lg leading-relaxed">
            {landingData.hero.subtitle.en}
            <br />
            <span className="text-sm text-white/55 italic">
              {landingData.hero.subtitle.fr}
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            {/* Primary CTA */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-brand-red rounded-full blur opacity-40 group-hover:opacity-70 transition duration-700 animate-pulse" />
              <button
                onClick={handleReportWaste}
                className="relative flex items-center gap-3 bg-brand-red hover:bg-[#a10e1e] text-white px-7 py-4 rounded-full text-lg font-bold shadow-xl hover:shadow-2xl transition-all transform active:scale-95 focus:ring-4 focus:ring-white/30"
              >
                <Megaphone className="h-5 w-5" />
                {landingData.hero.ctaText.en}
              </button>
            </div>

            {/* Secondary CTA */}
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 hover:border-white/40 px-7 py-4 rounded-full text-lg font-semibold transition-all duration-300 active:scale-95">
              Learn More
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── RIGHT: Visual Panel ── */}
        <div className="flex flex-col gap-6 lg:pl-4">
          {/* Hero Image Card */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl h-64 sm:h-72">
            <img
              src={landingData.hero.imageUrl}
              alt={landingData.hero.imageCaption}
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
            {/* Gradient overlay on image */}
            <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
            {/* Caption pill */}
            <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md text-white text-sm font-medium px-3 py-1 rounded-full border border-white/20">
              📍 {landingData.hero.imageCaption}
            </div>
          </div>

          {/* Impact Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            {stats.map(({ icon: Icon, value, label, color, bg }) => (
              <div
                key={label}
                className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 flex flex-col items-center text-center hover:bg-white/15 transition-colors duration-300"
              >
                <div
                  className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-2`}
                >
                  <Icon size={20} className={color} />
                </div>
                <span className="text-white font-extrabold text-xl leading-none">
                  {value}
                </span>
                <span className="text-white/60 text-xs mt-1 leading-tight">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Success story snippet */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5 flex items-center gap-4">
            <div className="flex -space-x-3 shrink-0">
              {[
                "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop",
                "https://images.unsplash.com/photo-1530785602389-07594baea8b0?w=80&h=80&fit=crop",
                "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=80&h=80&fit=crop",
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="Community member"
                  className="w-10 h-10 rounded-full border-2 border-brand-green object-cover"
                />
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-brand-green bg-brand-yellow/80 flex items-center justify-center text-brand-text text-xs font-bold">
                +99
              </div>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">
                Join the community
              </p>
              <p className="text-white/55 text-xs">
                Thousands already making a difference in Cameroon
              </p>
            </div>
          </div>
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
