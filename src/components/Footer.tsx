import { Logo } from "./Logo";
import { landingData } from "../constants/landingData";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export function Footer() {
  const {
    description,
    quickLinks,
    legalLinks,
    contactInfo,
    socialLinks,
    copyright,
  } = landingData.footer;

  return (
    <footer className="bg-white pt-20 pb-10 border-t border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section: Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand & Description (Spans 4 cols on lg) */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <div className="mb-6 hover:scale-105 transition-transform duration-300 cursor-pointer">
              <Logo />
            </div>
            <p className="text-brand-text/70 mb-8 leading-relaxed max-w-sm">
              {description.en}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href={socialLinks.facebook}
                className="w-10 h-10 rounded-full bg-brand-surface flex items-center justify-center text-brand-text/70 hover:bg-brand-green hover:text-white transition-all transform hover:-translate-y-1 shadow-sm hover:shadow-md active:scale-95"
              >
                <span className="sr-only">Facebook</span>
                <Facebook size={18} />
              </a>
              <a
                href={socialLinks.twitter}
                className="w-10 h-10 rounded-full bg-brand-surface flex items-center justify-center text-brand-text/70 hover:bg-brand-green hover:text-white transition-all transform hover:-translate-y-1 shadow-sm hover:shadow-md active:scale-95"
              >
                <span className="sr-only">Twitter</span>
                <Twitter size={18} />
              </a>
              <a
                href={socialLinks.instagram}
                className="w-10 h-10 rounded-full bg-brand-surface flex items-center justify-center text-brand-text/70 hover:bg-brand-green hover:text-white transition-all transform hover:-translate-y-1 shadow-sm hover:shadow-md active:scale-95"
              >
                <span className="sr-only">Instagram</span>
                <Instagram size={18} />
              </a>
              <a
                href={socialLinks.linkedin}
                className="w-10 h-10 rounded-full bg-brand-surface flex items-center justify-center text-brand-text/70 hover:bg-brand-green hover:text-white transition-all transform hover:-translate-y-1 shadow-sm hover:shadow-md active:scale-95"
              >
                <span className="sr-only">LinkedIn</span>
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links (Spans 2 cols on lg) */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h3 className="font-bold text-brand-text text-lg mb-6">
              Quick Links
            </h3>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-brand-text/70 hover:text-brand-green font-medium transition-colors inline-block relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-green transition-all group-hover:w-full"></span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links (Spans 2 cols on lg) */}
          <div className="lg:col-span-2">
            <h3 className="font-bold text-brand-text text-lg mb-6">Legal</h3>
            <ul className="space-y-4">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-brand-text/70 hover:text-brand-green font-medium transition-colors inline-block relative group"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-green transition-all group-hover:w-full"></span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info (Spans 3 cols on lg) */}
          <div className="lg:col-span-3">
            <h3 className="font-bold text-brand-text text-lg mb-6">
              Contact Us
            </h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-4 text-brand-text/70 group">
                <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center shrink-0 text-brand-green group-hover:bg-brand-green group-hover:text-white transition-all duration-300">
                  <MapPin size={18} />
                </div>
                <span className="leading-relaxed pt-2 group-hover:text-brand-green transition-colors">
                  {contactInfo.address}
                </span>
              </li>
              <li className="flex items-center gap-4 text-brand-text/70 group">
                <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center shrink-0 text-brand-green group-hover:bg-brand-green group-hover:text-white transition-all duration-300">
                  <Phone size={18} />
                </div>
                <a
                  href={`tel:${contactInfo.phone.replace(/\s+/g, "")}`}
                  className="hover:text-brand-green font-medium transition-colors group-hover:text-brand-green"
                >
                  {contactInfo.phone}
                </a>
              </li>
              <li className="flex items-center gap-4 text-brand-text/70 group">
                <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center shrink-0 text-brand-green group-hover:bg-brand-green group-hover:text-white transition-all duration-300">
                  <Mail size={18} />
                </div>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="hover:text-brand-green font-medium transition-colors group-hover:text-brand-green"
                >
                  {contactInfo.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section: Copyright */}
        <div className="pt-8 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-brand-text/50 text-sm font-medium hover:text-brand-text/80 transition-colors cursor-default">
            {copyright}
          </p>
          <p className="text-brand-text/50 text-sm font-medium hover:text-brand-text/80 transition-colors cursor-default group">
            Designed with passion in Africa
          </p>
        </div>
      </div>
    </footer>
  );
}
