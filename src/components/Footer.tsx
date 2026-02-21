import { Logo } from "./Logo";
import { landingData } from "../constants/landingData";
import { Facebook, Twitter, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-brand-surface py-12 border-t border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Logo />
            <p className="text-sm text-brand-text/60">
              {landingData.footer.copyright}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="#"
              className="p-2 text-brand-text/60 hover:text-brand-green transition-colors"
            >
              <span className="sr-only">Facebook</span>
              <Facebook size={20} />
            </a>
            <a
              href="#"
              className="p-2 text-brand-text/60 hover:text-brand-green transition-colors"
            >
              <span className="sr-only">Twitter</span>
              <Twitter size={20} />
            </a>
            <a
              href="#"
              className="p-2 text-brand-text/60 hover:text-brand-green transition-colors"
            >
              <span className="sr-only">Instagram</span>
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
