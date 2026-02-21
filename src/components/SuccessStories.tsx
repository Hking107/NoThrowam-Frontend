import { landingData } from "../constants/landingData";
import { ArrowRight, Leaf } from "lucide-react";

export function SuccessStories() {
  return (
    <section id="stories" className="py-20 bg-brand-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-10 md:mb-16">
          <Leaf className="text-brand-green h-8 w-8" />
          <h2 className="heading-section text-brand-text">
            {landingData.successStories.sectionTitle}
          </h2>
        </div>

        {/* CSS-only snap scrolling carousel for mobile / Grid for desktop */}
        <div className="flex overflow-x-auto pb-8 -mx-4 px-4 snap-x snap-mandatory hide-scrollbar md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:pb-0 md:mx-0 md:px-0">
          {landingData.successStories.items.map((story) => (
            <div
              key={story.id}
              className="flex-none w-80 md:w-auto snap-center mr-4 md:mr-0 card-green group cursor-pointer flex flex-col h-full"
            >
              {/* Image Container with Hover Effect */}
              <div className="relative h-48 mb-6 overflow-hidden rounded-xl">
                <img
                  src={story.imageUrl}
                  alt={story.title}
                  className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300" />
              </div>

              {/* Content */}
              <div className="flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2 text-brand-text group-hover:text-brand-green transition-colors">
                    {story.title}
                  </h3>
                  <p className="text-brand-text/70">{story.description}</p>
                </div>

                {/* Visual Indicator */}
                <div className="mt-4 flex items-center text-sm font-semibold text-brand-green">
                  <span>Read more</span>
                  <ArrowRight className="ml-1 h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
