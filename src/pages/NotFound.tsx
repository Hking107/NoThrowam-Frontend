import { useRef } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Home, ArrowLeft, Search } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function NotFound() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out", duration: 1 },
      });

      tl.from(".error-code", {
        y: 50,
        opacity: 0,
        scale: 0.8,
        delay: 0.2,
      })
      .from(".error-title", {
        y: 30,
        opacity: 0,
      }, "-=0.6")
      .from(".error-desc", {
        y: 20,
        opacity: 0,
      }, "-=0.7")
      .from(".error-cta", {
        scale: 0.9,
        opacity: 0,
        stagger: 0.1,
      }, "-=0.7");

      // Floating animation for a search icon or something
      gsap.to(".floating-icon", {
        y: -15,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
    { scope: containerRef }
  );

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface selection:bg-brand-green/20">
      <Navbar />

      <main 
        ref={containerRef}
        className="grow flex flex-col items-center justify-center px-4 py-20 text-center relative overflow-hidden"
      >
        {/* Background Decorative Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-green/5 rounded-full blur-3xl -z-10" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-brand-yellow/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-2xl mx-auto flex flex-col items-center">
          {/* Animated Icon */}
          <div className="floating-icon w-24 h-24 bg-brand-green/10 rounded-3xl flex items-center justify-center mb-8 text-brand-green shadow-sm border border-brand-green/10">
            <Search size={48} />
          </div>

          {/* Error Code */}
          <h1 className="error-code text-[120px] md:text-[180px] font-black leading-none tracking-tighter text-brand-green/20 select-none">
            404
          </h1>

          {/* Content */}
          <div className="relative -mt-10 md:-mt-16 mb-12">
            <h2 className="error-title text-4xl md:text-5xl font-extrabold text-brand-text mb-4">
              Oops! Page Not Found.
            </h2>
            <p className="error-desc text-lg md:text-xl text-brand-text/60 max-w-md mx-auto leading-relaxed">
              Looks like the path you're looking for was either recycled into something else or never existed. 
              <span className="block mt-2 font-medium italic text-brand-green/70 text-sm">
                "Not all who wander are lost, but this page definitely is."
              </span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="error-cta flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/"
              className="btn-primary px-8 py-4 flex items-center gap-2 text-lg shadow-xl hover:shadow-brand-green/20"
            >
              <Home size={20} />
              Return Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="btn border-2 border-brand-green/20 hover:border-brand-green/40 bg-white text-brand-text px-8 py-4 flex items-center gap-2 text-lg transition-all"
            >
              <ArrowLeft size={20} />
              Go Back
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
