import { createServiceClient } from "@/lib/supabase/server";
import { listFromStorage } from "@/lib/gallery-source";
import GalleryGrid from "@/components/GalleryGrid";
import GalleryPageClient from "./GalleryPageClient";
import { PageHero } from "@/components/PageSection";
import Reveal from "@/components/motion/Reveal";
import BrandMotif from "@/components/BrandMotif";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const images = await listFromStorage(() => Promise.resolve(createServiceClient()));
  const list = images ?? [];

  return (
    <div>
      <PageHero>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Gallery</h1>
        <p className="text-lg text-white/90">
          Moments from the Prefect Summit and RoG SLDP programme.
        </p>
      </PageHero>
      <section className="relative overflow-hidden w-full bg-brand-motif">
        <BrandMotif />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <Reveal>
            {list.length > 0 ? (
              <GalleryGrid images={list} />
            ) : (
              <GalleryPageClient />
            )}
          </Reveal>
        </div>
      </section>
    </div>
  );
}
