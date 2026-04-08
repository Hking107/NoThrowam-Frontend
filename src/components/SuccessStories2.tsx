import { useRef } from "react";
import { landingData } from "../contexts/constants/landingData";
import { ArrowUpRight, Leaf } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

// Pixels of vertical scroll allocated per card transition.
// More = slower, more deliberate feel between cards.
const CARD_SCROLL_PX = 800;

export function SuccessStories() {
  const { sectionTitle, items } = landingData.successStories;
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const DESIRED_COUNT = 6;
  const extendedItems = Array.from({ length: DESIRED_COUNT }).map((_, i) => {
    const baseItem = items[i % items.length];
    return {
      ...baseItem,
      id: `story-${i}`,
      title:
        i >= items.length
          ? `${baseItem.title} - Chapter ${i + 1}`
          : baseItem.title,
    };
  });
  const CARD_COUNT = extendedItems.length;

  useGSAP(
    () => {
      // Header entrance
      gsap.from(".ss-header > *", {
        y: 40,
        opacity: 0,
        duration: 1.1,
        ease: "power4.out",
        stagger: 0.12,
        scrollTrigger: { trigger: ".ss-header", start: "top 85%" },
      });

      // ── The entire carousel is ONE tween: slide the track from card 0 → last card ──
      // xPercent is relative to the track's own total width (CARD_COUNT * 100vw).
      // Moving by -(100 / CARD_COUNT) shifts exactly one card-width.
      // "none" easing keeps per-card scroll distance perfectly equal.
      gsap.to(trackRef.current, {
        xPercent: -((CARD_COUNT - 1) * (100 / CARD_COUNT)),
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          scrub: 1.2, // lag behind scroll slightly for smoothness
          anticipatePin: 1,
          end: () => `+=${CARD_SCROLL_PX * (CARD_COUNT - 1)}`,
        },
      });
    },
    { scope: containerRef },
  );

  const tagPalette = [
    { bg: "bg-amber-400" },
    { bg: "bg-emerald-400" },
    { bg: "bg-sky-400" },
    { bg: "bg-rose-400" },
    { bg: "bg-violet-400" },
    { bg: "bg-teal-400" },
  ];

  return (
    <>
      <style>{`
        .card-inner {
          position: relative;
          overflow: hidden;
          border-radius: 1.5rem;
        }
        .card-image {
          position: relative;
          width: 100%;
          height: 100%;
          z-index: 1;
        }
        .card-image-bg {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .card-text-panel {
          position: absolute;
          top: 0;
          right: 0;
          width: 42%;
          height: 100%;
          z-index: 3;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 2.5rem 2rem 2.5rem 2.5rem;
          background: linear-gradient(
            135deg,
            rgba(12, 12, 12, 0.97) 0%,
            rgba(24, 24, 24, 0.95) 100%
          );
          backdrop-filter: blur(8px);
        }
        .card-vignette {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            rgba(0,0,0,0.45) 0%,
            transparent 45%,
            rgba(0,0,0,0.65) 100%
          );
          z-index: 2;
          pointer-events: none;
        }
        /* Subtle scale on the visible card's image for depth */
        .card-image-bg {
          transition: transform 0.6s ease;
        }
      `}</style>

      <section
        id="stories"
        ref={containerRef}
        className="relative bg-stone-950 overflow-hidden"
      >
        {/* Grain */}
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "180px",
          }}
        />
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-emerald-900/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col min-h-screen py-14 px-6 lg:px-12">
          {/* ── Header ── */}
          <div className="ss-header flex items-end justify-between mb-12 max-w-[1400px] mx-auto w-full">
            <div>
              <div className="inline-flex items-center gap-2 border border-emerald-500/30 text-emerald-400 font-semibold px-3 py-1 rounded-full text-xs mb-5 tracking-widest uppercase">
                <Leaf size={12} /> Community Impact
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white leading-[0.92] tracking-tight">
                {sectionTitle}
              </h2>
            </div>
            <p className="hidden md:block text-stone-500 text-sm tracking-wide pb-1 shrink-0 ml-8">
              Scroll to explore →
            </p>
          </div>

          {/* ── Horizontal carousel track ── */}
          {/* overflow-hidden clips cards that are off-screen */}
          <div className="flex-1 flex items-center overflow-hidden">
            <div
              ref={trackRef}
              className="flex gap-6 will-change-transform"
              style={{ width: `${CARD_COUNT * 100}vw` }}
            >
              {extendedItems.map((story, i) => {
                const tag = tagPalette[i % tagPalette.length];
                const location =
                  story.title.split(" in ")[1] ||
                  `Region ${String(i + 1).padStart(2, "0")}`;

                return (
                  <div
                    key={story.id}
                    // Each card slot is one viewport-width wide (minus the gap offset).
                    // Using w-screen keeps cards at exactly 100vw regardless of gap.
                    className="w-screen shrink-0 flex justify-center items-center px-6 lg:px-16"
                  >
                    <div className="w-full max-w-5xl">
                      {/* ── Card ── */}
                      <div
                        className="card-inner shadow-[0_32px_80px_rgba(0,0,0,0.65)]"
                        style={{ height: "clamp(440px, 60vh, 620px)" }}
                      >
                        {/* Image layer */}
                        <div className="card-image">
                          <img
                            src={story.imageUrl}
                            alt={story.title}
                            className="card-image-bg"
                            loading="lazy"
                          />
                          <div className="card-vignette" />
                          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent z-2" />

                          {/* ── Card number: top-left, always visible ── */}
                          <div className="absolute top-6 left-7 z-4 flex items-baseline gap-1">
                            <span className="font-mono font-black text-white text-lg leading-none tabular-nums">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span className="text-white/30 text-xs font-semibold">
                              / {String(CARD_COUNT).padStart(2, "0")}
                            </span>
                          </div>

                          {/* Bottom-left: location tag + title */}
                          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 z-4">
                            <span
                              className={`inline-block ${tag.bg} text-stone-900 text-[10px] font-black uppercase tracking-[0.18em] px-3 py-1 rounded-full mb-4`}
                            >
                              {location}
                            </span>
                            <h3 className="text-2xl md:text-4xl font-black text-white leading-tight max-w-[56%]">
                              {story.title}
                            </h3>
                          </div>
                        </div>

                        {/* ── Right text panel — always visible ── */}
                        <div className="card-text-panel">
                          <div
                            className={`w-8 h-0.5 ${tag.bg} rounded-full mb-5`}
                          />
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-3">
                            Impact Story
                          </p>
                          <p className="text-stone-300 text-sm leading-relaxed mb-6">
                            {story.description} This initiative brought the
                            community together in ways we never anticipated,
                            creating lasting change across the region.
                          </p>
                          <div className="h-px w-full bg-white/8 mb-6" />
                          <button className="group/btn inline-flex items-center gap-3 text-white font-bold text-xs uppercase tracking-widest">
                            <span className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center transition-all duration-300 group-hover/btn:bg-emerald-400 group-hover/btn:border-emerald-400 group-hover/btn:text-stone-900">
                              <ArrowUpRight size={15} />
                            </span>
                            Read Full Story
                          </button>
                        </div>
                      </div>

                      {/* ── Dot indicator row ── */}
                      <div className="flex items-center justify-between mt-5 px-1">
                        <p className="text-stone-600 text-xs uppercase tracking-widest font-semibold">
                          {location}
                        </p>
                        <div className="flex items-center gap-1.5">
                          {extendedItems.map((_, d) => (
                            <span
                              key={d}
                              className={`block rounded-full ${
                                d === i
                                  ? "w-6 h-1 bg-emerald-400"
                                  : "w-1 h-1 bg-white/15"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
