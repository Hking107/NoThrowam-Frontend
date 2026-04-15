import { X, Mail, Phone, MapPin, Send } from "lucide-react";
import { landingData } from "../contexts/constants/landingData";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { email, phone, address } = landingData.footer.contactInfo;

  useGSAP(() => {
    if (isOpen) {
      // Entrance animation
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });
      gsap.fromTo(
        contentRef.current,
        {
          y: 50,
          opacity: 0,
          scale: 0.95,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.7)",
          delay: 0.1,
        }
      );
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd send this to an API
    // For now, we'll just show a success "state" or alert
    alert(`Thank you! Your message has been sent to ${email}.`);
    onClose();
  };

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
    >
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 transition-opacity"
      />

      {/* Modal Content */}
      <div
        ref={contentRef}
        className="relative w-full max-w-4xl bg-brand-surface rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row opacity-0"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors z-10 text-brand-text/50 hover:text-brand-text"
        >
          <X size={24} />
        </button>

        {/* Left Side: Contact Info (African Vibes/Green) */}
        <div className="md:w-2/5 bg-brand-green p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-red/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
            <p className="text-white/80 mb-10 leading-relaxed">
              Have questions about waste management or want to partner with us? 
              Our team is here to help you make Cameroon cleaner.
            </p>

            <div className="space-y-6">
              <a href={`mailto:${email}`} className="flex items-center gap-4 group cursor-pointer">
                <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                  <Mail size={20} className="text-brand-yellow" />
                </div>
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-widest font-bold">Email Us</p>
                  <p className="font-medium">{email}</p>
                </div>
              </a>

              <a href={`tel:${phone}`} className="flex items-center gap-4 group cursor-pointer">
                <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                  <Phone size={20} className="text-brand-yellow" />
                </div>
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-widest font-bold">Call Us</p>
                  <p className="font-medium">{phone}</p>
                </div>
              </a>

              <div className="flex items-center gap-4 group">
                <div className="p-3 bg-white/10 rounded-xl">
                  <MapPin size={20} className="text-brand-yellow" />
                </div>
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-widest font-bold">Our Office</p>
                  <p className="font-medium whitespace-pre-line">{address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-white/40 text-sm">
            © 2026 NoThrowam. All rights reserved.
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-3/5 p-8 md:p-12 bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-text/60 ml-1">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-5 py-3 rounded-xl bg-brand-surface border border-black/5 focus:border-brand-green/30 focus:ring-4 focus:ring-brand-green/10 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-text/60 ml-1">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="john@example.com"
                  className="w-full px-5 py-3 rounded-xl bg-brand-surface border border-black/5 focus:border-brand-green/30 focus:ring-4 focus:ring-brand-green/10 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-text/60 ml-1">Subject</label>
              <select className="w-full px-5 py-3 rounded-xl bg-brand-surface border border-black/5 focus:border-brand-green/30 focus:ring-4 focus:ring-brand-green/10 outline-none transition-all appearance-none cursor-pointer">
                <option>General Inquiry</option>
                <option>Partnership Proposal</option>
                <option>Reporting an Issue</option>
                <option>Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-text/60 ml-1">Message</label>
              <textarea
                required
                rows={4}
                placeholder="How can we help you?"
                className="w-full px-5 py-3 rounded-xl bg-brand-surface border border-black/5 focus:border-brand-green/30 focus:ring-4 focus:ring-brand-green/10 outline-none transition-all resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full btn-primary py-4 flex items-center justify-center gap-3 text-lg group shadow-xl hover:shadow-brand-green/20"
            >
              <span>Send Message</span>
              <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>

            <p className="text-center text-xs text-brand-text/40">
              We usually respond within 24 hours on business days.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
