import { useEffect, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LenisProvider } from "../contexts/LenisContext";

/**
 * SmoothScroll component integrates Lenis for inertia-based scrolling.
 * It synchronizes with the GSAP ticker to ensure frame-perfect animations.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    // 1. Initialize Lenis
    const lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    setLenis(lenisInstance);

    // 2. Synchronize Lenis with GSAP ScrollTrigger
    // This is crucial: Whenever Lenis scrolls, tell ScrollTrigger to update positions.
    lenisInstance.on("scroll", ScrollTrigger.update);

    // 3. Add Lenis to GSAP's ticker
    // This ensures both run on the same RequestAnimationFrame (RAF) loop for maximum performance.
    const raf = (time: number) => {
      lenisInstance.raf(time * 1000); // gsap.ticker passes time in seconds, lenis expects milliseconds
    };

    gsap.ticker.add(raf);

    // 4. Disable GSAP's lag smoothing
    // This prevents "jumps" when returning to the tab or when the browser throttles frames.
    gsap.ticker.lagSmoothing(0);

    // 5. Cleanup on unmount
    return () => {
      gsap.ticker.remove(raf);
      lenisInstance.destroy();
    };
  }, []);

  return <LenisProvider lenisInstance={lenis}>{children}</LenisProvider>;
}
