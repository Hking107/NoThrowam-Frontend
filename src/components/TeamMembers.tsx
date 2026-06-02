import { useRef } from "react";
import { Linkedin, Mail } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { landingData } from "../hooks/constants/landingData";

gsap.registerPlugin(ScrollTrigger);

export function TeamMembers() {
  const containerRef = useRef<HTMLElement>(null);
  const { teamMembers } = landingData;

  useGSAP(
    () => {
      const headerItems = gsap.utils.toArray<HTMLElement>(".team-header > *");
      const cards = gsap.utils.toArray<HTMLElement>(".team-card");
      const photos = gsap.utils.toArray<HTMLElement>(".team-photo");

      gsap.from(headerItems, {
        y: 32,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".team-header",
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      gsap.from(".team-divider", {
        scaleX: 0,
        duration: 0.8,
        ease: "power2.out",
        transformOrigin: "left center",
        scrollTrigger: {
          trigger: ".team-divider",
          start: "top 88%",
          toggleActions: "play none none none",
        },
      });

      gsap.from(cards, {
        y: 36,
        scale: 0.97,
        duration: 0.75,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".team-grid",
          start: "top 82%",
          toggleActions: "play none none none",
        },
      });

      gsap.to(photos, {
        y: -5,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.25,
      });

      ScrollTrigger.refresh();
    },
    { scope: containerRef },
  );

  return (
    <section
      id="team"
      ref={containerRef}
      data-nav-bg="bg-brand-surface"
      className="relative w-full bg-brand-surface py-24 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-0 w-85 h-85 rounded-full bg-brand-green/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[320px] h-80 rounded-full bg-brand-yellow/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="team-header text-center mb-4">
          <span className="inline-block bg-brand-green/10 text-brand-green font-bold text-sm px-4 py-1.5 rounded-full mb-4 tracking-wide uppercase">
            Our Team
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-text tracking-tight mb-4">
            Meet the People Behind NoThrowam
          </h2>
          <p className="text-brand-text/60 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            A focused team building cleaner communities, stronger recycling
            markets, and better tools for local action.
          </p>
        </div>

        <div className="team-divider w-16 h-1 bg-brand-yellow rounded-full mx-auto mb-16" />

        <div className="team-grid max-w-5xl mx-auto flex flex-wrap justify-center gap-6">
          {teamMembers.map((member) => (
            <article
              key={member.id}
              className="team-card group w-full sm:w-[calc(50%_-_12px)] lg:w-[calc((100%_-_48px)/3)] bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-black/5 hover:border-brand-green/20 transition-all duration-300 text-center flex flex-col items-center"
            >
              <div className="relative overflow-hidden rounded-full w-36 h-36 bg-brand-green/10 mb-5 shadow-inner">
                <img
                  src={member.image}
                  alt={member.name}
                  className="team-photo h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-brand-text/45 to-transparent" />
              </div>

              <div className="space-y-2 flex flex-col items-center">
                <div>
                  <h3 className="text-brand-text font-extrabold text-lg leading-tight">
                    {member.name}
                  </h3>
                  <p className="text-brand-green text-sm font-bold">
                    {member.role}
                  </p>
                </div>

                <p className="text-brand-text/50 text-xs font-semibold uppercase tracking-wider">
                  {member.location}
                </p>

                <p className="text-brand-text/65 text-sm leading-relaxed">
                  {member.bio}
                </p>

                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    className="w-10 h-10 rounded-full bg-brand-surface flex items-center justify-center text-brand-text/70 hover:bg-brand-green hover:text-white transition-all transform hover:-translate-y-1 shadow-sm hover:shadow-md active:scale-95"
                    aria-label={`Email ${member.name}`}
                  >
                    <Mail size={15} />
                  </button>
                  <button
                    className="w-10 h-10 rounded-full bg-brand-surface flex items-center justify-center text-brand-text/70 hover:bg-brand-green hover:text-white transition-all transform hover:-translate-y-1 shadow-sm hover:shadow-md active:scale-95"
                    aria-label={`${member.name} LinkedIn`}
                  >
                    <Linkedin size={15} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
