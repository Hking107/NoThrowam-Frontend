import { useState, useEffect } from "react";
import { User, Menu, X, UserPlus } from "lucide-react";
import { landingData } from "../contexts/constants/landingData";
import { Logo } from "./Logo";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [navBg, setNavBg] = useState<string>(
    "bg-brand-surface/90 backdrop-blur-md",
  );

  useGSAP(() => {
    gsap.from(".navbar-anim", {
      y: -20,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
      delay: 0.2,
    });
  });

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[data-nav-bg]");
      const navHeight = 80;

      // Default: hero area (top of page) — keep transparent/blur
      let currentBg = "bg-brand-surface/70 backdrop-blur-md";

      sections.forEach((section) => {
        const el = section as HTMLElement;
        const rect = el.getBoundingClientRect();

        // Check if this section is currently occupying the navbar position
        if (rect.top <= navHeight && rect.bottom > navHeight) {
          const sectionBg = el.dataset.navBg;
          if (sectionBg) {
            currentBg = sectionBg;
          }
        }
      });

      setNavBg(currentBg);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // run once on mount

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`navbar-anim sticky top-0 z-50 w-full border-b border-black/5 transition-colors duration-300 ${navBg}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section (Left) */}
          <div className="shrink-0">
            <a href="#" className="focus:outline-none">
              <Logo />
            </a>
          </div>

          {/* Navigation & Actions Section (Right aligned) */}
          <div className="hidden md:flex items-center gap-8">
            {/* Desktop Navigation Links */}
            <div className="flex items-center gap-6 lg:gap-8">
              {landingData.header.links.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="relative text-brand-text/80 hover:text-brand-green font-medium transition-colors after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-brand-green after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Desktop Action Buttons */}
            <div className="flex items-center gap-4 border-l border-black/10 pl-6 lg:pl-8">
              <button className="text-brand-green font-bold hover:text-[#052a20] hover:scale-105 transition-all duration-300 flex items-center gap-2 cursor-pointer">
                <User size={18} />
                <span>{landingData.header.signInText}</span>
              </button>
              <button className="btn-primary flex items-center gap-2 py-2 px-5 cursor-pointer">
                <UserPlus size={18} />
                <span>{landingData.header.registerText}</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-brand-text p-2 focus:outline-none focus:ring-2 focus:ring-brand-green rounded-md"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-black/5 absolute w-full shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-4">
            {landingData.header.links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-brand-text/80 hover:text-brand-green hover:bg-brand-green/5"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 border-t border-black/5 flex flex-col gap-3">
              <button className="w-full flex items-center justify-center gap-2 text-brand-green font-bold py-2 hover:bg-brand-green/5 rounded-md transition-colors">
                <User size={18} />
                <span>{landingData.header.signInText}</span>
              </button>
              <button className="btn-primary w-full flex items-center justify-center gap-2">
                <UserPlus size={18} />
                <span>{landingData.header.registerText}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
