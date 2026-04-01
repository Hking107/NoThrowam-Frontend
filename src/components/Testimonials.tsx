import { useRef, useState, useCallback } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    id: 1,
    name: "Amina Bello",
    role: "Market Vendor, Douala",
    avatar: "AB",
    rating: 5,
    quote:
      "NoThrowam changed how our market handles waste. Within two weeks, collectors came every day and our street looks completely different now.",
    quotefr: "NoThrowam a changé notre façon de gérer les déchets au marché.",
  },
  {
    id: 2,
    name: "Jean-Paul Mvondo",
    role: "School Principal, Yaoundé",
    avatar: "JM",
    rating: 5,
    quote:
      "We introduced NoThrowam to our students and they became environmental ambassadors in their own neighborhoods. The impact was immediate.",
    quotefr:
      "Nos élèves sont devenus de véritables ambassadeurs de l'environnement.",
  },
  {
    id: 3,
    name: "Fatima Njoya",
    role: "Community Leader, Bafoussam",
    avatar: "FN",
    rating: 4,
    quote:
      "Reporting a dump site used to feel useless. Now I get a notification when it's cleaned. That accountability is everything.",
    quotefr:
      "Signaler un dépôt sauvage a enfin un sens. Je reçois une confirmation quand c'est nettoyé.",
  },
  {
    id: 4,
    name: "Théodore Elong",
    role: "Recycling Collector, Douala",
    avatar: "TE",
    rating: 5,
    quote:
      "As a collector, the app gives me a steady stream of jobs. My income has grown by 40% since I joined the platform six months ago.",
    quotefrr:
      "Mes revenus ont augmenté de 40% depuis que j'ai rejoint la plateforme.",
  },
  {
    id: 5,
    name: "Céleste Abanda",
    role: "University Student, Yaoundé",
    avatar: "CA",
    rating: 5,
    quote:
      "I love the green points system. I've already redeemed enough for two months of internet data just by reporting waste near campus.",
    quotefr:
      "J'ai déjà échangé mes points verts pour deux mois de données internet.",
  },
  {
    id: 6,
    name: "Ibrahim Oumarou",
    role: "NGO Coordinator, Ngaoundéré",
    avatar: "IO",
    rating: 4,
    quote:
      "We integrated NoThrowam into our field operations. The data it provides helps us allocate resources where they're needed most.",
    quotefr:
      "Les données fournies nous aident à allouer nos ressources là où elles sont le plus nécessaires.",
  },
];

const CARDS_PER_PAGE = 3;

export function Testimonials() {
  const container = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalPages = Math.ceil(testimonials.length / CARDS_PER_PAGE);

  const slideTo = useCallback(
    (nextIndex: number) => {
      if (!trackRef.current) return;
      const direction = nextIndex > currentIndex ? -1 : 1;

      gsap.fromTo(
        trackRef.current,
        { x: direction * -60, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.45, ease: "power3.out" },
      );

      setCurrentIndex(nextIndex);
    },
    [currentIndex],
  );

  const handlePrev = () => {
    slideTo(currentIndex === 0 ? totalPages - 1 : currentIndex - 1);
  };

  const handleNext = () => {
    slideTo(currentIndex === totalPages - 1 ? 0 : currentIndex + 1);
  };

  const visibleTestimonials = testimonials.slice(
    currentIndex * CARDS_PER_PAGE,
    currentIndex * CARDS_PER_PAGE + CARDS_PER_PAGE,
  );

  useGSAP(
    () => {
      gsap.from(".testimonials-header", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".testimonials-header",
          start: "top 85%",
        },
      });

      gsap.from(".testimonials-divider", {
        scaleX: 0,
        duration: 0.8,
        ease: "power2.out",
        transformOrigin: "left center",
        scrollTrigger: {
          trigger: ".testimonials-divider",
          start: "top 88%",
        },
      });

      gsap.from(".testimonials-carousel", {
        y: 50,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".testimonials-carousel",
          start: "top 80%",
        },
      });

      gsap.to(".quote-icon", {
        y: -6,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.4,
      });

      gsap.from(".testimonials-cta", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".testimonials-cta",
          start: "top 90%",
        },
      });
    },
    { scope: container },
  );

  return (
    <section
      id="testimonials"
      ref={container}
      data-nav-bg="bg-brand-surface"
      className="relative w-full bg-brand-surface py-24 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-brand-green/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-brand-yellow/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="testimonials-header text-center mb-4">
          <span className="inline-block bg-brand-green/10 text-brand-green font-bold text-sm px-4 py-1.5 rounded-full mb-4 tracking-wide uppercase">
            Community Voices
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-text tracking-tight mb-4">
            Real People. Real Impact.
          </h2>
          <p className="text-brand-text/60 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Thousands of Cameroonians are already making a difference. Here's
            what they have to say.
          </p>
        </div>

        {/* Animated divider */}
        <div className="testimonials-divider w-16 h-1 bg-brand-yellow rounded-full mx-auto mb-16" />

        {/* Carousel */}
        <div className="testimonials-carousel">
          {/* Cards Track */}
          <div
            ref={trackRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {visibleTestimonials.map((t) => (
              <div
                key={t.id}
                className="testimonial-card group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-black/5 hover:border-brand-green/20 transition-all duration-300 flex flex-col gap-4"
              >
                {/* Floating quote icon */}
                <div className="quote-icon absolute -top-4 right-6 w-9 h-9 bg-brand-green rounded-full flex items-center justify-center shadow-md">
                  <Quote size={16} className="text-white fill-white" />
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      size={14}
                      className={
                        s < t.rating
                          ? "text-brand-yellow fill-brand-yellow"
                          : "text-black/15 fill-black/15"
                      }
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-brand-text/80 text-sm leading-relaxed flex-1">
                  "{t.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-2 border-t border-black/5">
                  <div className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-brand-text font-bold text-sm leading-tight">
                      {t.name}
                    </p>
                    <p className="text-brand-text/50 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6 mt-10">
            {/* Prev */}
            <button
              onClick={handlePrev}
              className="w-10 h-10 rounded-full border border-black/10 bg-white hover:border-brand-green hover:text-brand-green flex items-center justify-center shadow-sm transition-all duration-200 active:scale-95"
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => slideTo(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? "w-6 h-2.5 bg-brand-green"
                      : "w-2.5 h-2.5 bg-black/15 hover:bg-brand-green/40"
                  }`}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>

            {/* Next */}
            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-full border border-black/10 bg-white hover:border-brand-green hover:text-brand-green flex items-center justify-center shadow-sm transition-all duration-200 active:scale-95"
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="testimonials-cta mt-16 text-center">
          <p className="text-brand-text/60 text-sm mb-4">
            Join over <span className="text-brand-green font-bold">3,500+</span>{" "}
            active members across Cameroon
          </p>
          <button className="btn-primary inline-flex items-center gap-2 px-8 py-3">
            Become Part of the Story
          </button>
        </div>
      </div>
    </section>
  );
}
