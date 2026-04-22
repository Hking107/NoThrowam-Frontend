import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ContactModal } from "../components/ContactModal";
import { ShieldAlert, LogIn, Home, Lock } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function Unauthorized() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  useGSAP(
    () => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out", duration: 1 },
      });

      tl.from(".error-icon-bg", {
        scale: 0.5,
        opacity: 0,
        duration: 1.2,
      })
        .from(
          ".error-title",
          {
            y: 30,
            opacity: 0,
          },
          "-=0.8",
        )
        .from(
          ".error-desc",
          {
            y: 20,
            opacity: 0,
          },
          "-=0.7",
        )
        .from(
          ".error-cta",
          {
            scale: 0.9,
            opacity: 0,
            stagger: 0.1,
          },
          "-=0.7",
        );

      // Pulsing effect for the lock icon
      gsap.to(".error-lock-icon", {
        scale: 1.1,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
    { scope: containerRef },
  );

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface selection:bg-brand-red/10">
      <Navbar onContactClick={() => setIsContactModalOpen(true)} />

      <main
        ref={containerRef}
        className="grow flex flex-col items-center justify-center px-4 py-20 text-center relative overflow-hidden"
      >
        {/* Background Decorative Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-red/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-brand-green/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-xl mx-auto flex flex-col items-center">
          {/* Animated Lock Icon */}
          <div className="error-icon-bg relative mb-10">
            <div className="w-32 h-32 bg-brand-red/10 rounded-full flex items-center justify-center border border-brand-red/10">
              <Lock className="error-lock-icon text-brand-red" size={56} />
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border border-brand-red/20 text-brand-red">
              <ShieldAlert size={24} />
            </div>
          </div>

          {/* Content */}
          <div className="mb-12">
            <h1 className="error-title text-4xl md:text-6xl font-black text-brand-text mb-6">
              Access Denied.
            </h1>
            <p className="error-desc text-lg md:text-xl text-brand-text/60 leading-relaxed">
              It seems you've encountered a restricted area. You don't have the
              necessary permissions to view this page's content at the moment.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="error-cta flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/signin"
              className="btn-accent px-8 py-4 flex items-center gap-2 text-lg shadow-xl hover:shadow-brand-red/20"
            >
              <LogIn size={20} />
              Sign in as Another User
            </Link>
            <Link
              to="/"
              className="btn border-2 border-brand-text/10 hover:border-brand-text/30 bg-white text-brand-text px-8 py-4 flex items-center gap-2 text-lg transition-all"
            >
              <Home size={20} />
              Return Home
            </Link>
          </div>

          <p className="mt-12 text-sm text-brand-text/40 font-medium tracking-wide uppercase">
            Reason: HTTP 403 / Restricted Access
          </p>
        </div>
      </main>

      <Footer />
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
    </div>
  );
}
