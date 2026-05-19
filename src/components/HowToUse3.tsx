import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { landingData } from "../hooks/constants/landingData";
// Import icons that represent your steps (Adjust these to match your actual steps)
import { Download, Camera, MapPin, Recycle, CheckCircle } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const { steps, sectionTitle, sectionSubtitle } = landingData.howToUse;

// 1. Gradients for the Right-Side Cards
const vibrantGradients = [
  "from-emerald-500 to-emerald-700",
  "from-amber-400 to-orange-500",
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-pink-600",
  "from-rose-500 to-red-600",
];

// 2. Exact Hex Colors for the Left-Side Timeline (Matched to gradients above)
const timelineColors = [
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#3b82f6", // Blue
  "#a855f7", // Purple
  "#f43f5e", // Rose
];

// 3. Icons mapped to the steps
const TimelineIcons = [Download, Camera, MapPin, Recycle, CheckCircle];

export function HowToUse() {
  const containerRef = useRef<HTMLElement>(null);
  const cardsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const iconsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const activeStepRef = useRef<number>(-1); // Start at -1 to force initial update

  useGSAP(
    () => {
      const totalSteps = steps.length;
      const scrollDistance = () => window.innerHeight * totalSteps;

      // Initial Setup for Cards
      gsap.set(cardsRefs.current.slice(1), { opacity: 0, y: 40, scale: 0.95 });
      gsap.set(cardsRefs.current[0], { opacity: 1, y: 0, scale: 1 });

      // Setup Progress Line Initial State
      gsap.set(progressLineRef.current, {
        scaleY: 0,
        transformOrigin: "top center",
      });

      // Animate the thread (progress line) growing downwards based on scroll
      gsap.to(progressLineRef.current, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top center", // Starts growing before it pins
          end: `+=${scrollDistance()}`,
          scrub: true,
        },
      });

      // Entrance animation for the Header and Left Timeline
      gsap.from(".how-to-anim", {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 90%", // Triggers as soon as the section comes into view
        },
      });

      // Main Timeline for the Crossfading Cards
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${scrollDistance()}`,
          pin: true,
          scrub: 1, // 1 second smoothing
          onUpdate: (self) => {
            const p = self.progress;
            const activeIndex = Math.min(
              Math.floor(p * totalSteps * 0.99),
              totalSteps - 1,
            );

            // If the step changed, update the timeline UI
            if (activeIndex !== activeStepRef.current) {
              activeStepRef.current = activeIndex;
              updateTimelineState(activeIndex);
            }
          },
        },
      });

      // Build the Card Crossfade Sequence
      steps.forEach((_, i) => {
        if (i === 0) return;
        const transitionLabel = `step-${i}`;

        // Fade out previous card
        tl.to(
          cardsRefs.current[i - 1],
          {
            opacity: 0,
            y: -40,
            scale: 0.95,
            duration: 1,
            ease: "power2.inOut",
          },
          transitionLabel,
        );

        // Fade in current card
        tl.to(
          cardsRefs.current[i],
          { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power2.inOut" },
          transitionLabel,
        );
      });

      // Helper function to handle the Icon & Thread animations
      function updateTimelineState(activeIndex: number) {
        const currentColor =
          timelineColors[activeIndex % timelineColors.length];

        // 1. Animate the thread color to match the card
        gsap.to(progressLineRef.current, {
          backgroundColor: currentColor,
          duration: 0.4,
          ease: "power2.out",
        });

        // 2. Animate the Icons
        iconsRefs.current.forEach((iconNode, i) => {
          if (!iconNode) return;
          const isTarget = i === activeIndex;

          gsap.to(iconNode, {
            // Scale up if active, shrink if inactive
            scale: isTarget ? 2.0 : 1,
            // Match border and box-shadow to the current card color if active
            borderColor: isTarget ? currentColor : "#e5e7eb", // gray-200
            boxShadow: isTarget ? `0 0 20px ${currentColor}40` : "none",
            duration: 0.5,
            ease: isTarget ? "back.out(1.5)" : "power2.out",
          });

          // Animate the SVG icon color inside the node
          const svgIcon = iconNode.querySelector("svg");
          if (svgIcon) {
            gsap.to(svgIcon, {
              color: isTarget ? currentColor : "#9ca3af", // gray-400
              duration: 0.5,
            });
          }
        });
      }

      // Initialize the first step explicitly
      updateTimelineState(0);
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      id="about"
      className="h-screen w-full flex flex-col justify-center space-y-12 bg-brand-surface overflow-hidden relative py-12"
    >
      <div className="max-w-7xl w-full mt-8 mx-auto px-4 sm:px-6 lg:px-8 flex flex-col h-full">
        {/* Header */}
        <div className="how-to-anim text-center mb-6 md:mb-6 shrink-0">
          <h2 className="text-4xl md:text-5xl font-extrabold text-brand-text mb-4">
            {sectionTitle}
          </h2>
          <p className="text-lg text-brand-text/70 max-w-2xl mx-auto">
            {sectionSubtitle}
          </p>
        </div>

        {/* Split Layout */}
        <div className="flex flex-col lg:flex-row gap-12 flex-1 items-center relative">
          {/* Left Column: The Interactive Timeline */}
          <div className="how-to-anim hidden lg:flex w-full lg:w-1/3 h-[400px] md:h-[500px] relative items-center justify-center">
            {/* Wrapper for the timeline line and icons */}
            <div className="relative h-full py-8 flex flex-col justify-between items-center w-full">
              {/* The Static Background Thread */}
              <div className="absolute left-1/2 top-8 bottom-8 w-1 -translate-x-1/2 bg-gray-200 rounded-full z-0" />

              {/* The Dynamic Colored Thread (Grows via GSAP) */}
              <div
                ref={progressLineRef}
                className="absolute left-1/2 top-8 bottom-8 w-1 -translate-x-1/2 rounded-full z-0"
              />

              {/* The Icons */}
              {steps.map((step, i) => {
                const Icon = TimelineIcons[i % TimelineIcons.length];
                return (
                  <div
                    key={step.number}
                    className="relative z-10 w-full flex justify-center group"
                  >
                    <div
                      ref={(el) => {
                        iconsRefs.current[i] = el;
                      }}
                      className="w-12 h-12 rounded-full bg-white border-4 flex items-center justify-center transition-colors"
                    >
                      <Icon size={20} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Absolute Card Viewer */}
          <div className="w-full lg:w-2/3 h-[400px] md:h-[500px] relative perspective-1000">
            {steps.map((step, i) => {
              const gradient = vibrantGradients[i % vibrantGradients.length];

              return (
                <div
                  key={step.number}
                  ref={(el) => {
                    cardsRefs.current[i] = el;
                  }}
                  className={`absolute inset-0 w-full h-full p-8 md:p-12 rounded-4xl shadow-2xl flex flex-col justify-center text-white bg-linear-to-br ${gradient}`}
                >
                  {/* Decorative blur circle inside the card */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                  <div className="relative z-10">
                    <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white font-bold rounded-full text-sm w-fit mb-6 border border-white/20 shadow-sm">
                      Step {step.number}
                    </span>
                    <h3 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight drop-shadow-sm">
                      {step.title}
                    </h3>
                    <p className="text-lg md:text-xl text-white/90 leading-relaxed font-medium">
                      {step.description}
                    </p>
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
