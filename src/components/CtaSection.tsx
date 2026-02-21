import { landingData } from "../constants/landingData";
import { ArrowRight, Mail } from "lucide-react";

export function CtaSection() {
  const { title, subtitle, primaryCtaText, secondaryCtaText } =
    landingData.ctaSection;

  return (
    <section className="relative py-20 lg:py-28 bg-brand-surface overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main CTA Container */}
        <div className="relative rounded-[2.5rem] overflow-hidden bg-brand-green">
          {/* Abstract Background Shapes */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-yellow/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-red/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

          <div className="relative px-6 py-16 md:py-20 lg:px-16 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Text Content */}
            <div className="max-w-2xl text-white">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
                {title.en}
              </h2>
              <p className="text-lg text-white/80 md:text-xl font-medium mb-2">
                {subtitle.en}
              </p>
              <div className="text-sm text-white/50 italic">
                {title.fr} — {subtitle.fr}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full lg:w-auto px-4 sm:px-0">
              <button className="flex items-center justify-center gap-2 bg-brand-yellow hover:bg-[#e0b810] text-brand-text px-8 py-4 rounded-full text-lg font-bold shadow-xl transition-all transform active:scale-95">
                {primaryCtaText.en}
                <ArrowRight className="h-5 w-5" />
              </button>

              <button className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-full text-lg font-bold transition-all transform active:scale-95">
                <Mail className="h-5 w-5" />
                {secondaryCtaText.en}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
