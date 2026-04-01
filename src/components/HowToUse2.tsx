import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { landingData } from "../constants/landingData";

gsap.registerPlugin(ScrollTrigger);

const { steps, sectionTitle, sectionSubtitle } = landingData.howToUse;

// Array of vibrant gradients for the cards
const vibrantGradients = [
  "from-brand-green to-emerald-600",
  "from-brand-yellow to-orange-500",
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-pink-600",
  "from-rose-500 to-red-600",
];

export function HowToUse() {
  const containerRef = useRef<HTMLElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const cardsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeStepRef = useRef<number>(0);

  useGSAP(
    () => {
      const totalSteps = steps.length;

      // Calculate scroll distance based on number of steps (1 window height per step)
      const scrollDistance = () => window.innerHeight * totalSteps;

      // 1. Initial Setup for Cards
      // Hide all cards except the first one, push them down slightly
      gsap.set(cardsRefs.current.slice(1), {
        opacity: 0,
        y: 40,
        scale: 0.95,
      });
      gsap.set(cardsRefs.current[0], {
        opacity: 1,
        y: 0,
        scale: 1,
      });

      // 2. The Main Scrub Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${scrollDistance()}`,
          pin: true, // Pin the whole section
          scrub: 1, // 1 second smoothing on the scrub
          onUpdate: (self) => {
            // Determine active step based on overall progress
            const p = self.progress;
            // The 0.99 ensures we don't accidentally index out of bounds at the very bottom
            const activeIndex = Math.min(
              Math.floor(p * totalSteps * 0.99),
              totalSteps - 1,
            );

            // Update phone UI if the step has changed
            if (activeIndex !== activeStepRef.current) {
              activeStepRef.current = activeIndex;
              updatePhoneState(activeIndex);
            }
          },
        },
      });

      // 3. Build the Crossfade Sequence
      // We loop through the steps and tell GSAP when to fade out the old card and fade in the new one
      steps.forEach((_, i) => {
        if (i === 0) return; // Skip the first one as it's our starting state

        const transitionLabel = `step-${i}`;

        // Fade out previous card (moves up and fades out)
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

        // Fade in current card (moves up into place and fades in)
        tl.to(
          cardsRefs.current[i],
          { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power2.inOut" },
          transitionLabel,
        );
      });

      // 4. Phone Float Animation
      gsap.to(phoneRef.current, {
        y: -15,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Helper function to animate phone state
      function updatePhoneState(activeIndex: number) {
        // Quick scale pop on the phone to signify a change
        gsap.fromTo(
          phoneRef.current,
          { scale: 0.95 },
          { scale: 1, duration: 0.4, ease: "back.out(1.5)", overwrite: "auto" },
        );

        // Update dots
        const dots = document.querySelectorAll(".phone-dot");
        dots.forEach((dot, i) => {
          if (i === activeIndex) {
            gsap.to(dot, {
              backgroundColor: "#fbbf24",
              scale: 1.2,
              duration: 0.3,
            }); // brand-yellow approx
          } else {
            gsap.to(dot, {
              backgroundColor: "rgba(255,255,255,0.3)",
              scale: 1,
              duration: 0.3,
            });
          }
        });
      }
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      id="how-to-use"
      className="h-screen w-full flex flex-col justify-center bg-brand-surface overflow-hidden relative py-12"
    >
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col h-full">
        {/* Header - Stays fixed at the top of the pinned section */}
        <div className="text-center mb-8 md:mb-12 shrink-0">
          <h2 className="text-4xl md:text-5xl font-extrabold text-brand-text mb-4">
            {sectionTitle}
          </h2>
          <p className="text-lg text-brand-text/70 max-w-2xl mx-auto">
            {sectionSubtitle}
          </p>
        </div>

        {/* 50/50 Split Layout */}
        <div className="flex flex-col lg:flex-row gap-12 flex-1 items-center relative">
          {/* Left Column: The Phone */}
          <div className="w-full lg:w-1/2 flex items-center justify-center h-full">
            <div
              ref={phoneRef}
              className="relative w-full max-w-[280px] md:max-w-sm aspect-9/19 bg-gray-900 rounded-[3rem] shadow-2xl border-[8px] border-gray-800 flex flex-col items-center justify-center overflow-hidden"
            >
              {/* Replace with your actual phone asset/UI */}
              <div className="absolute inset-0 bg-linear-to-b from-brand-green/20 to-brand-surface" />
              <img
                src="/phone.png"
                alt="App interface"
                className="relative z-10 w-[90%] h-[90%] object-contain"
              />

              {/* Progress Dots inside phone */}
              <div className="absolute bottom-8 flex gap-2 z-20">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className="phone-dot w-2.5 h-2.5 rounded-full bg-white/30"
                    style={{
                      backgroundColor: i === 0 ? "#fbbf24" : undefined,
                      scale: i === 0 ? 1.2 : 1,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Absolute Card Viewer */}
          <div className="w-full lg:w-1/2 h-[400px] md:h-[500px] relative perspective-1000">
            {steps.map((step, i) => {
              // Pick a gradient, looping back if there are more steps than colors
              const gradient = vibrantGradients[i % vibrantGradients.length];

              return (
                <div
                  key={step.number}
                  ref={(el) => {
                    cardsRefs.current[i] = el;
                  }}
                  className={`absolute inset-0 w-full h-full p-8 md:p-12 rounded-[2rem] shadow-2xl flex flex-col justify-center text-white bg-linear-to-br ${gradient}`}
                >
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
