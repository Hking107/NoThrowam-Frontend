import { useRef } from "react";
import {
  Megaphone,
  MapPin,
  // Recycle,
  // Users,
  // Leaf,
  ArrowRight,
  TriangleAlert,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { landingData } from "../contexts/constants/landingData";
import { useNavigate } from "react-router-dom";

// Register GSAP plugins if needed (none needed for basic animations here)

// const stats = [
//   {
//     icon: Recycle,
//     value: "12,000+",
//     label: "Kg Collected",
//     color: "text-brand-green",
//     bg: "bg-brand-green/10",
//   },
//   {
//     icon: Users,
//     value: "3,500+",
//     label: "Active Members",
//     color: "text-brand-yellow",
//     bg: "bg-brand-yellow/20",
//   },
//   {
//     icon: Leaf,
//     value: "8",
//     label: "Cities Covered",
//     color: "text-brand-red",
//     bg: "bg-brand-red/10",
//   },
// ];

export function Hero() {
  const container = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const bgBlobsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleReportWaste = () => {
    navigate("/report-waste");
  };

  useGSAP(
    () => {
      // 1. Entrance Animations: Staggered reveal for text content
      const tl = gsap.timeline({
        defaults: { ease: "power3.out", duration: 1 },
      });

      tl.from(".hero-badge", {
        y: -20,
        opacity: 0,
        delay: 0.2,
      })
        .from(
          ".hero-title",
          {
            y: 30,
            opacity: 0,
            stagger: 0.1,
          },
          "-=0.6",
        )
        .from(
          ".hero-subtitle",
          {
            y: 20,
            opacity: 0,
          },
          "-=0.7",
        )
        .from(
          ".hero-cta",
          {
            scale: 0.9,
            opacity: 0,
            stagger: 0.1,
          },
          "-=0.7",
        );

      // 2. Visual Panel Entrance
      gsap.from(visualRef.current, {
        x: 50,
        opacity: 0,
        duration: 1.2,
        ease: "power2.out",
        delay: 0.5,
      });

      // 3. Floating effect for Visual Panel
      gsap.to(visualRef.current, {
        y: -15,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // 4. Background Blobs subtle movement
      if (bgBlobsRef.current) {
        gsap.to(".bg-blob", {
          x: "random(-40, 40)",
          y: "random(-40, 40)",
          duration: "random(4, 7)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: 0.5,
        });
      }
    },
    { scope: container },
  );

  return (
    <section
      id="hero"
      ref={container}
      className="relative w-full min-h-screen overflow-hidden bg-linear-to-br from-[#004d3a] via-brand-green to-[#009e72]"
    >
      {/* Subtle background texture / gradient blobs */}
      <div
        ref={bgBlobsRef}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <div className="bg-blob absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
        <div className="bg-blob absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-brand-yellow/10 blur-3xl" />
        <div className="bg-blob absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-black/10 blur-3xl" />
      </div>

      {/* Two-column grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-28 md:py-32">
        {/* ── LEFT: Text & CTAs ── */}
        <div ref={textRef} className="flex flex-col items-start text-white">
          {/* Badge */}
          <div className="hero-badge inline-flex items-center gap-2 bg-brand-yellow/90 backdrop-blur-sm text-brand-text font-bold px-4 py-1.5 rounded-full text-sm mb-8 shadow-sm">
            <MapPin size={15} />
            Welcome to the NoThrowam Initiative
          </div>

          {/* Headline */}
          <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-3">
            {landingData.hero.title.en}
          </h1>
          <p className="hero-title text-lg sm:text-xl font-medium text-white/60 italic mb-6">
            {landingData.hero.title.fr}
          </p>

          {/* Subtitle */}
          <p className="hero-subtitle text-base sm:text-lg text-white/80 mb-10 max-w-lg leading-relaxed">
            {landingData.hero.subtitle.en}
            <br />
            <span className="text-sm text-white/55 italic">
              {landingData.hero.subtitle.fr}
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            {/* Primary CTA */}
            <div className="hero-cta relative group">
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
            <button
              onClick={() => navigate("/signup")}
              className="hero-cta flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 hover:border-white/40 px-7 py-4 rounded-full text-lg font-semibold transition-all duration-300 active:scale-95 cursor-pointer"
            >
              Learn More
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── RIGHT: Visual Panel ── */}
        <div ref={visualRef} className="flex flex-col gap-6 lg:pl-4">
          {/* Hero Image Card */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl h-64 sm:h-96 group">
            <img
              src={landingData.hero.imageUrl}
              alt={landingData.hero.imageCaption}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
            {/* Report waste overlay - visible on hover */}
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
              <TriangleAlert className="h-32 w-32 text-red-500 mb-4 animate-pulse" />
              <button
                onClick={handleReportWaste}
                className="bg-red-600 hover:bg-red-700 text-white border border-red-500/30 rounded-2xl p-4 flex items-center justify-between gap-6 transition-all duration-300 shadow-2xl hover:shadow-red-600/40 active:scale-95"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-xl hover:bg-white/30 transition-colors">
                    <Megaphone size={28} className="animate-pulse" />
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-bold uppercase tracking-tight leading-tight">
                      Report Waste
                    </p>
                    <p className="text-white/80 text-xs mt-0.5">
                      Immediate action for a cleaner environment
                    </p>
                  </div>
                </div>
                <div className="bg-white/10 p-2 rounded-full group-hover:translate-x-1 transition-transform">
                  <ArrowRight size={20} />
                </div>
              </button>
            </div>

            {/* Caption pill */}
            <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md text-white text-sm font-medium px-3 py-1 rounded-full border border-white/20">
              📍 {landingData.hero.imageCaption}
            </div>
          </div>

          {/* Impact Stats Row */}
          {/* <div className="grid grid-cols-3 gap-3">
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
          </div> */}

          {/* Urgent Report Action */}
          {/* <button
            onClick={handleReportWaste}
            className="bg-red-600 hover:bg-red-700 text-white border border-red-500/30 rounded-2xl p-6 flex items-center justify-between gap-6 transition-all duration-300 shadow-2xl hover:shadow-red-600/40 group active:scale-95"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl group-hover:bg-white/30 transition-colors">
                <Megaphone size={28} className="animate-pulse" />
              </div>
              <div className="text-left">
                <p className="text-lg font-bold uppercase tracking-tight leading-tight">
                  Report Waste
                </p>
                <p className="text-white/80 text-xs mt-0.5">
                  Immediate action for a cleaner environment
                </p>
              </div>
            </div>
            <div className="bg-white/10 p-2 rounded-full group-hover:translate-x-1 transition-transform">
              <ArrowRight size={20} />
            </div>
          </button> */}
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
            d="M0,0 C300,60 900,60 1200,0 L1200,120 L0,120 Z"
            className="fill-brand-surface"
          ></path>
        </svg>
      </div>
    </section>
  );
}
