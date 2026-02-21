import { landingData } from "../constants/landingData";
import { ArrowRight, Leaf, MapPin } from "lucide-react";

export function SuccessStories() {
  const { sectionTitle, items } = landingData.successStories;

  // Assuming we always have at least 3 items for this layout
  const featuredStory = items[0];
  const sideStories = items.slice(1, 3);

  return (
    <section
      id="stories"
      className="relative py-24 bg-brand-surface overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-yellow/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-green/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-brand-green/10 text-brand-green font-bold px-4 py-1.5 rounded-full text-sm mb-4">
            <Leaf size={16} /> Community Impact
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-brand-text mb-4 tracking-tight">
            {sectionTitle}
          </h2>
          <p className="text-lg text-brand-text/70">
            Real change happens when we work together. See how NoThrowam is
            transforming neighborhoods across Cameroon.
          </p>
        </div>

        {/* Bento Box Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
          {/* Featured Large Card (Spans 7 cols on lg screens) */}
          <div className="lg:col-span-7 group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer h-[400px] lg:h-auto">
            {/* Background Image */}
            <img
              src={featuredStory.imageUrl}
              alt={featuredStory.title}
              className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 group-hover:opacity-90" />

            {/* Tag */}
            <div className="absolute top-6 left-6 bg-brand-yellow text-brand-text text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-md">
              <MapPin size={12} />{" "}
              {featuredStory.title.split(" in ")[1] || "Featured"}
            </div>

            {/* Content Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 transform transition-transform duration-300">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {featuredStory.title}
              </h3>
              <p className="text-white/80 text-lg mb-6 line-clamp-2">
                {featuredStory.description}
              </p>

              <div className="inline-flex items-center text-brand-yellow font-bold text-sm uppercase tracking-wide group/btn">
                Read Full Story
                <span className="ml-2 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-all group-hover/btn:bg-brand-yellow group-hover/btn:text-brand-text">
                  <ArrowRight
                    size={16}
                    className="transform transition-transform group-hover/btn:translate-x-0.5"
                  />
                </span>
              </div>
            </div>
          </div>

          {/* Right Column Stack (Spans 5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {sideStories.map((story, idx) => (
              <div
                key={story.id}
                className="flex-1 group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer min-h-[280px]"
              >
                {/* Background Image */}
                <img
                  src={story.imageUrl}
                  alt={story.title}
                  className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />

                {/* Tag */}
                <div className="absolute top-5 left-5 bg-white/20 backdrop-blur-md text-white border border-white/20 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
                  <MapPin size={12} />{" "}
                  {story.title.split(" in ")[1] || `Story 0${idx + 2}`}
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                    {story.title}
                  </h3>
                  <p className="text-white/70 text-sm mb-4 line-clamp-2">
                    {story.description}
                  </p>

                  <div className="flex items-center text-white/90 font-semibold text-sm group/link">
                    Read more
                    <ArrowRight
                      size={14}
                      className="ml-1.5 opacity-0 -translate-x-2 transition-all duration-300 group-hover/link:opacity-100 group-hover/link:translate-x-0 text-brand-yellow"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
