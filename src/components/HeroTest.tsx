import { useRef } from "react";
import {
  Megaphone,
  MapPin,
  Recycle,
  Users,
  Leaf,
  ArrowRight,
  TriangleAlert,
  Camera,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { landingData } from "../contexts/constants/landingData";
import { useNavigate } from "react-router-dom";

const stats = [
  { icon: Recycle, value: "12,000+", label: "Kg Collected" },
  { icon: Users, value: "3,500+", label: "Active Members" },
  { icon: Leaf, value: "8", label: "Cities Covered" },
];

export function HeroTest() {
  const container = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleReportWaste = () => {
    navigate("/report-waste");
  };

  useGSAP(
    () => {
      /* ───────────────────────────────────────────────
         Parallax Fade — layered depth entrance.
         Each layer enters at a different speed & offset,
         creating a sense of depth and organic movement.
         ─────────────────────────────────────────────── */

      // Layer 1 — Background image: slow fade in
      gsap.from(".hero-bg-image", {
        opacity: 0,
        scale: 1.08,
        duration: 2,
        ease: "power2.out",
        delay: 0.1,
      });

      // Layer 2 — Badge: drops in from above
      gsap.from(".hero-badge", {
        opacity: 0,
        y: -25,
        duration: 0.9,
        ease: "power3.out",
        delay: 0.4,
      });

      // Layer 3 — Title lines: each from a progressively larger Y offset
      gsap.from(".hero-title-line", {
        opacity: 0,
        y: (i) => 35 + i * 20,
        duration: 1.1,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.5,
      });

      // Layer 4 — French subtitle
      gsap.from(".hero-fr-subtitle", {
        opacity: 0,
        y: 25,
        duration: 1,
        ease: "power2.out",
        delay: 0.9,
      });

      // Layer 5 — Description
      gsap.from(".hero-subtitle", {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power2.out",
        delay: 1.1,
      });

      // Layer 6 — CTAs
      gsap.from(".hero-cta", {
        opacity: 0,
        y: 25,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        delay: 1.3,
      });

      // Layer 7 — Stats
      gsap.from(".hero-stat", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        delay: 1.5,
      });

      // Layer 8 — Caption pill
      gsap.from(".hero-caption", {
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        delay: 1.6,
      });

      // Layer 9 — Report Waste floating card
      gsap.from(".hero-report-card", {
        opacity: 0,
        x: 40,
        duration: 1.2,
        ease: "power3.out",
        delay: 1.7,
      });

      /* ───────────────────────────────────────────────
         AMBIENT — Floating background blobs
         ─────────────────────────────────────────────── */
      gsap.to(".hero-bg-blob", {
        x: "random(-30, 30)",
        y: "random(-30, 30)",
        duration: "random(5, 8)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.5,
      });
    },
    { scope: container },
  );

  return (
    <section
      id="hero"
      ref={container}
      // data-nav-bg="bg-[#004d3a]"
      className="relative w-full min-h-screen overflow-hidden"
    >
      {/* ═══════════════════════════════════════════════
          BACKGROUND LAYERS
          ═══════════════════════════════════════════════ */}

      {/* Base green gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-[#002b20] via-[#004d3a] to-[#077257]" />

      {/* Faded hero image overlaid on top of the green */}
      <div className="hero-bg-image absolute inset-0">
        <img
          src={landingData.hero.imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="eager"
        />
        {/* Green tint overlay — blends image into the green theme */}
        <div className="absolute inset-0 bg-[#003d2e]/70" />
        {/* Gradient fade: image is most visible on the right, fades to green on the left */}
        <div className="absolute inset-0 bg-linear-to-r from-[#002b20]/95 via-[#004d3a]/80 to-transparent" />
        {/* Bottom fade for the wave divider */}
        <div className="absolute inset-0 bg-linear-to-t from-[#003d2e]/60 via-transparent to-[#002b20]/40" />
      </div>

      {/* Animated accent blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="hero-bg-blob absolute -top-24 -left-24 w-[400px] h-[400px] rounded-full bg-white/[0.03] blur-[80px]" />
        <div className="hero-bg-blob absolute bottom-[-10%] right-[-5%] w-[350px] h-[350px] rounded-full bg-brand-yellow/[0.06] blur-[100px]" />
        <div className="hero-bg-blob absolute top-[30%] right-[10%] w-[300px] h-[300px] rounded-full bg-brand-green/[0.08] blur-[90px]" />
      </div>

      {/* ═══════════════════════════════════════════════
          CONTENT — Single panel, left-aligned
          ═══════════════════════════════════════════════ */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 min-h-screen flex items-center">
        <div className="w-full max-w-2xl py-28 lg:py-20">
          {/* Badge */}
          <div className="hero-badge inline-flex items-center gap-2 bg-white/[0.08] backdrop-blur-md border border-white/[0.12] text-white/90 font-medium px-4 py-2 rounded-full text-sm mb-10">
            <MapPin size={15} className="text-brand-yellow" />
            <span className="tracking-wide">NoThrowam Initiative</span>
          </div>

          {/* Headline */}
          <h1 className="mb-4">
            <span className="hero-title-line block text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Transforming
            </span>
            <span className="hero-title-line block text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Waste in{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-yellow to-brand-yellow/80">
                Cameroon.
              </span>
            </span>
          </h1>

          {/* French subtitle */}
          <p className="hero-fr-subtitle text-lg sm:text-xl font-medium text-white/50 italic mb-8">
            {landingData.hero.title.fr}
          </p>

          {/* Description */}
          <p className="hero-subtitle text-base sm:text-lg text-white/70 mb-10 max-w-lg leading-relaxed">
            {landingData.hero.subtitle.en}
            <br />
            <span className="text-sm text-white/45 italic mt-1 inline-block">
              {landingData.hero.subtitle.fr}
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mb-14">
            {/* Primary CTA */}
            <div className="hero-cta relative group">
              <div className="absolute -inset-1.5 bg-brand-red rounded-full blur-md opacity-40 group-hover:opacity-70 transition duration-500" />
              <button
                onClick={handleReportWaste}
                className="relative flex items-center gap-3 bg-brand-red hover:bg-[#b31425] text-white px-8 py-4 rounded-full text-lg font-bold shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 active:scale-95 focus:ring-4 focus:ring-red-400/30 cursor-pointer"
              >
                <Megaphone className="h-5 w-5" />
                {landingData.hero.ctaText.en}
              </button>
            </div>

            {/* Secondary CTA */}
            <button
              onClick={() => navigate("/signup")}
              className="hero-cta flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-md text-white border border-white/[0.15] hover:border-white/[0.3] px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 hover:-translate-y-0.5 active:scale-95 cursor-pointer group"
            >
              Learn More
              <ArrowRight className="h-4 w-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          {/* Stats Row */}
          <div className="flex gap-8 sm:gap-10">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="hero-stat flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={16} className="text-brand-yellow/80" />
                  <span className="text-white font-extrabold text-2xl sm:text-3xl tracking-tight leading-none">
                    {value}
                  </span>
                </div>
                <span className="text-white/50 text-xs sm:text-sm font-medium tracking-wide uppercase">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Caption pill — anchored bottom-right over the visible image area */}
      <div className="hero-caption absolute bottom-28 right-8 bg-black/30 backdrop-blur-lg text-white text-sm font-medium px-4 py-2 rounded-full border border-white/15 z-10 hidden lg:block">
        📍 {landingData.hero.imageCaption}
      </div>

      {/* ═══════════════════════════════════════════════
          REPORT WASTE CARD — right side
          ═══════════════════════════════════════════════ */}
      <div className="hero-report-card absolute right-[10%] xl:right-[20%] top-1/2 -translate-y-1/2 z-20 hidden lg:block animate-[pulse_5s_ease-in-out_infinite]">
        <button
          onClick={handleReportWaste}
          className="group relative flex flex-col items-start text-left w-64 bg-black/40 backdrop-blur-xl border border-white/[0.15] hover:border-white/[0.3] rounded-3xl p-6 shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:bg-black/50 cursor-pointer"
        >
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-red shadow-lg shadow-brand-red/30 mb-4 transition-transform duration-300 group-hover:scale-105">
            <TriangleAlert size={24} className="text-white" />
          </div>

          {/* Text */}
          <div className="mb-4">
            <h3 className="text-white text-lg font-bold tracking-tight mb-1">
              Spotted Waste?
            </h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Take immediate action for a cleaner environment.
            </p>
          </div>

          {/* Action */}
          <div className="flex items-center gap-2 text-brand-yellow font-semibold text-sm transition-colors group-hover:text-yellow-400">
            <Camera size={16} />
            <span>Snap & Report</span>
            <ArrowRight
              size={14}
              className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
            />
          </div>
        </button>
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
