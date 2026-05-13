import { useRef } from "react";
import { landingData } from "../hooks/constants/landingData";
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

      <div className="relative z-10 flex flex-col min-h-screen py-10 md:py-14 px-4 sm:px-6 lg:px-12">
        {/* ── Header ── */}
        <div className="ss-header flex items-end justify-between mb-8 md:mb-12 max-w-[1400px] mx-auto w-full">
          <div>
            <div className="inline-flex items-center gap-2 border border-emerald-500/30 text-emerald-400 font-semibold px-3 py-1 rounded-full text-[10px] md:text-xs mb-3 md:mb-5 tracking-widest uppercase">
              <Leaf size={12} /> Community Impact
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black text-white leading-[1.1] md:leading-[0.92] tracking-tight">
              {sectionTitle}
            </h2>
          </div>
          <p className="hidden md:block text-stone-500 text-sm tracking-wide pb-1 shrink-0 ml-8">
            Scroll to explore →
          </p>
        </div>

        {/* ── Horizontal carousel track ── */}
        <div className="flex-1 flex items-center overflow-hidden -mx-4 sm:-mx-6 lg:-mx-12 px-4 sm:px-6 lg:px-12">
          <div
            ref={trackRef}
            className="flex will-change-transform"
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
                  className="w-screen shrink-0 flex justify-center items-center px-2 sm:px-6 lg:px-16"
                >
                  <div className="w-full max-w-5xl">
                    {/* ── Card ── */}
                    <div
                      className="relative overflow-hidden rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.65)] flex flex-col md:flex-row w-full group transition-all duration-300"
                      style={{ height: "clamp(520px, 70vh, 620px)" }}
                    >
                      {/* Image layer */}
                      <div className="relative w-full md:w-[58%] h-[55%] md:h-full shrink-0 overflow-hidden">
                        <img
                          src={story.imageUrl}
                          alt={story.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                        {/* Vignette */}
                        <div className="absolute inset-0 bg-linear-to-r from-black/60 via-transparent to-black/60 md:block hidden pointer-events-none" />
                        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent z-10" />

                        {/* ── Card number: always visible ── */}
                        <div className="absolute top-4 left-5 md:top-6 md:left-7 z-20 flex items-baseline gap-1">
                          <span className="font-mono font-black text-white text-base md:text-lg leading-none tabular-nums shadow-black drop-shadow-md">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="text-white/40 text-xs font-semibold shadow-black drop-shadow-md">
                            / {String(CARD_COUNT).padStart(2, "0")}
                          </span>
                        </div>

                        {/* Bottom-left: location tag + title */}
                        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 z-20">
                          <span
                            className={`inline-block ${tag.bg} text-stone-900 text-[10px] font-black uppercase tracking-[0.18em] px-3 py-1 rounded-full mb-2 md:mb-4`}
                          >
                            {location}
                          </span>
                          <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight max-w-[95%] md:max-w-[85%] text-shadow-sm shadow-black">
                            {story.title}
                          </h3>
                        </div>
                      </div>

                      {/* ── Text panel ── */}
                      <div className="relative w-full md:w-[42%] h-[45%] md:h-full flex flex-col justify-end p-5 md:p-8 lg:p-10 bg-linear-to-br from-[#0c0c0c] to-[#181818] z-20">
                        <div
                          className={`w-8 h-0.5 ${tag.bg} rounded-full mb-3 md:mb-5 shrink-0`}
                        />
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-2 md:mb-3 shrink-0">
                          Impact Story
                        </p>
                        <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mb-4 md:mb-6 line-clamp-3 sm:line-clamp-4 md:line-clamp-none">
                          {story.description} This initiative brought the
                          community together in ways we never anticipated,
                          creating lasting change across the region.
                        </p>
                        <div className="h-px w-full bg-white/10 mb-4 md:mb-6 shrink-0" />
                        <button className="group/btn inline-flex items-center gap-2 md:gap-3 text-white font-bold text-[10px] md:text-xs uppercase tracking-widest w-fit shrink-0">
                          <span className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-white/20 flex items-center justify-center transition-all duration-300 group-hover/btn:bg-emerald-400 group-hover/btn:border-emerald-400 group-hover/btn:text-stone-900">
                            <ArrowUpRight
                              size={14}
                              className="md:w-[15px] md:h-[15px]"
                            />
                          </span>
                          Read Full Story
                        </button>
                      </div>
                    </div>

                    {/* ── Dot indicator row ── */}
                    <div className="flex items-center justify-between mt-4 md:mt-5 px-2">
                      <p className="text-stone-600 text-[10px] md:text-xs uppercase tracking-widest font-semibold truncate max-w-[150px] sm:max-w-[200px]">
                        {location}
                      </p>
                      <div className="flex items-center gap-1 md:gap-1.5 shrink-0">
                        {extendedItems.map((_, d) => (
                          <span
                            key={d}
                            className={`block rounded-full transition-all duration-300 ${
                              d === i
                                ? "w-4 md:w-6 h-1 bg-emerald-400"
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
  );
}
