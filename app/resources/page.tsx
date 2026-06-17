import { resources } from "@/lib/resources";
import ResourceCard from "@/components/ResourceCard";
import Reveal from "@/components/motion/Reveal";
import { PageHero } from "@/components/PageSection";

export default function ResourcesPage() {
  return (
    <div>
      <PageHero>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Resources</h1>
        <p className="text-lg text-white/90">
          Programme materials and documents available for download.
        </p>
      </PageHero>
      <section className="w-full bg-brand-motif">
        <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((item, i) => (
            <Reveal key={item.id} delay={(i % 6) * 0.06}>
              <ResourceCard item={item} />
            </Reveal>
          ))}
        </div>
        </div>
      </section>
    </div>
  );
}
