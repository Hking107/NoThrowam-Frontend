import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { landingData } from "../constants/landingData";

gsap.registerPlugin(ScrollTrigger);

const { steps, sectionTitle, sectionSubtitle } = landingData.howToUse;

export function HowToUse() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const stepNumberRef = useRef<HTMLSpanElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Track the currently active step to prevent animation spam on every scroll tick
  const activeStepRef = useRef<number>(-1);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const phone = phoneRef.current;
    const stepNumber = stepNumberRef.current;
    const progressBar = progressBarRef.current;
    if (!section || !stage || !phone || !stepNumber || !progressBar) return;

    const totalSteps = steps.length;

    // FIX: GSAP end values must be pixel numbers — `vh` is not a valid GSAP unit.
    // Use window.innerHeight to calculate the equivalent pixel distance.
    const scrollDistance = () => totalSteps * window.innerHeight;

    const ctx = gsap.context(() => {
      // Set all text blocks invisible before any trigger fires
      stepRefs.current.forEach((stepEl) => {
        const textBlock = stepEl?.querySelector(
          ".step-text-block",
        ) as HTMLElement;
        if (textBlock) gsap.set(textBlock, { opacity: 0 });
      });

      // --- PIN THE ENTIRE STAGE so phone stays in viewport ---
      ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        // FIX: was `+=${steps.length * 100}vh` — vh not supported, must use pixels
        end: scrollDistance,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
      });

      // --- Phone entrance animation ---
      const entranceDuration = 1.2;
      gsap.fromTo(
        phone,
        { y: 80, opacity: 0, scale: 0.85 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: entranceDuration,
          ease: "expo.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      );

      // --- Progress bar ---
      gsap.set(progressBar, { scaleY: 0, transformOrigin: "top center" });
      gsap.to(progressBar, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: scrollDistance, // FIX: same vh issue as above
          scrub: true,
        },
      });

      // --- Global scroll → step transitions ---
      ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: scrollDistance, // FIX: same vh issue as above
        onUpdate: (self) => {
          const p = self.progress;
          const activeIndex = Math.min(
            Math.floor(p * totalSteps),
            totalSteps - 1,
          );

          // FIX: guard against re-running animations on every scroll frame tick.
          // Without this, GSAP fires a new fromTo on every pixel scrolled.
          if (activeIndex === activeStepRef.current) return;
          activeStepRef.current = activeIndex;

          // Update step number with bounce
          stepNumber.textContent = String(steps[activeIndex].number);
          gsap.fromTo(
            stepNumber,
            { scale: 0.6, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.6,
              ease: "elastic.out(1, 0.6)",
            },
          );

          // Update active dot
          phone.querySelectorAll(".phone-dot").forEach((dot, idx) => {
            dot.classList.toggle("active", idx === activeIndex);
          });

          // Hide all text blocks, then reveal only the active one
          stepRefs.current.forEach((stepEl, i) => {
            if (!stepEl) return;
            const textBlock = stepEl.querySelector(
              ".step-text-block",
            ) as HTMLElement;
            if (!textBlock) return;

            if (i !== activeIndex) {
              // FIX: kill competing tweens before hiding to avoid opacity conflicts
              gsap.killTweensOf(textBlock);
              gsap.to(textBlock, {
                opacity: 0,
                duration: 0.25,
                overwrite: true,
              });
            } else {
              const isLeft = i % 2 === 0;
              const badge = textBlock.querySelector(".step-badge");
              const title = textBlock.querySelector(".step-title");
              const desc = textBlock.querySelector(".step-description");

              // FIX: kill leftover tweens on child elements too
              gsap.killTweensOf(
                [textBlock, badge, title, desc].filter(Boolean),
              );

              gsap.to(textBlock, {
                opacity: 1,
                duration: 0.1,
                overwrite: true,
              });

              if (badge)
                gsap.fromTo(
                  badge,
                  { opacity: 0, x: isLeft ? -20 : 20 },
                  { opacity: 1, x: 0, duration: 0.4, overwrite: true },
                );
              if (title)
                gsap.fromTo(
                  title,
                  { opacity: 0, y: 20 },
                  {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    delay: 0.08,
                    overwrite: true,
                  },
                );
              if (desc)
                gsap.fromTo(
                  desc,
                  { opacity: 0, y: 15 },
                  {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    delay: 0.16,
                    overwrite: true,
                  },
                );
            }
          });
        },
      });

      // --- Phone float animation ---
      // FIX 1: was `y: "-=12"` (relative) — GSAP subtracts 12px on every yoyo
      //         repeat so the phone drifts infinitely upward off screen.
      //         Use absolute `y: -12` so it oscillates between 0 and -12px.
      // FIX 2: add `delay: entranceDuration` so the float doesn't fight the
      //         entrance tween which also owns the `y` property.
      gsap.to(phone, {
        y: -12,
        repeat: -1,
        yoyo: true,
        duration: 2.8,
        ease: "sine.inOut",
        delay: entranceDuration,
      });

      // --- Phone screen glow pulse ---
      const screenGlow = phone.querySelector(".phone-screen-glow");
      if (screenGlow) {
        gsap.to(screenGlow, {
          opacity: 0.6,
          repeat: -1,
          yoyo: true,
          duration: 2,
          ease: "sine.inOut",
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="how-to-use" className="how-to-section">
      <div className="how-to-header">
        <h2 className="heading-section text-brand-text">{sectionTitle}</h2>
        <p className="text-sub mt-3 max-w-2xl mx-auto">{sectionSubtitle}</p>
      </div>

      {/*
        FIX (horizontal line): The original used CSS Grid with
        `grid-template-columns: 1fr auto 1fr`. Even though .progress-track
        and .steps-track were position:absolute, they still participated in
        grid auto-placement, causing the grid to create an implicit second
        row with reserved height — visible as a thin horizontal line.

        Fix: remove the grid entirely. Use `position: relative` + flexbox
        so .phone-column is the only in-flow child, and the two overlay
        divs are truly out-of-flow absolute elements.
      */}
      <div ref={stageRef} className="how-to-stage">
        {/* Absolute overlay — left edge progress bar */}
        <div className="progress-track" aria-hidden="true">
          <div ref={progressBarRef} className="progress-fill" />
        </div>

        {/* In-flow — phone centered by flexbox */}
        <div className="phone-column">
          <div ref={phoneRef} className="phone-sticky">
            <div className="phone-wrapper">
              <div className="phone-glow" aria-hidden="true" />
              <img
                src="/phone.png"
                alt="Phone mockup"
                className="phone-image"
              />
              <div className="phone-screen-glow" aria-hidden="true" />
              <span ref={stepNumberRef} className="phone-step-number">
                1
              </span>
              <div className="phone-dots" aria-hidden="true">
                {steps.map((_, i) => (
                  <div key={i} className="phone-dot" data-index={i} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Absolute overlay — step text panels */}
        <div className="steps-track">
          {steps.map((step, i) => {
            const isLeft = i % 2 === 0;
            return (
              <div
                key={step.number}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                className={`step-panel ${isLeft ? "step-left" : "step-right"}`}
              >
                <div className="step-text-block">
                  <span className="step-badge">Step {step.number}</span>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
