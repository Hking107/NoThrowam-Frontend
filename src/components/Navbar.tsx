import { useState } from "react";
import { User, Menu, X, UserPlus } from "lucide-react";
import { landingData } from "../constants/landingData";
import { Logo } from "./Logo";
import {  useNavigate } from "react-router-dom";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate(); // Add navigate hook

  return (
    <nav className="sticky top-0 z-50 w-full bg-brand-surface/90 backdrop-blur-md border-b border-black/5">
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
              <button
                className="text-brand-green font-bold hover:text-[#005f48] transition-colors flex items-center gap-2"
                onClick={() => navigate("/signin")} // Add navigation for Sign In
              >
                <User size={18} />
                <span>{landingData.header.signInText}</span>
              </button>
              <button
                onClick={() => navigate("/signup")} // Add navigation for Register
                className="btn-primary flex items-center gap-2 py-2 px-5"
              >
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
              <button
                className="w-full flex items-center justify-center gap-2 text-brand-green font-bold py-2 hover:bg-brand-green/5 rounded-md transition-colors"
                onClick={() => {
                  navigate("/signin"); // Add navigation for Sign In (Mobile)
                  setIsMenuOpen(false);
                }}
              >
                <User size={18} />
                <span>{landingData.header.signInText}</span>
              </button>
              <button
                className="btn-primary w-full flex items-center justify-center gap-2"
                onClick={() => {
                  navigate("/register"); // Add navigation for Register (Mobile)
                  setIsMenuOpen(false);
                }}
              >
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
