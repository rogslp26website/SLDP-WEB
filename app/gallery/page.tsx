import { getCachedGalleryList } from "@/lib/gallery-cache";
import { paginateGalleryImages } from "@/lib/gallery-source";
import GalleryGrid from "@/components/GalleryGrid";
import GalleryPageClient from "./GalleryPageClient";
import { PageHero } from "@/components/PageSection";
import Reveal from "@/components/motion/Reveal";
import BrandMotif from "@/components/BrandMotif";

/** ISR: serve cached manifest; Storage is only hit when cache revalidates. */
export const revalidate = 300;

const INITIAL_PAGE_SIZE = 24;

export default async function GalleryPage() {
  const allImages = (await getCachedGalleryList()) ?? [];
  const { images: initialImages, total, hasMore } = paginateGalleryImages(
    allImages,
    0,
    INITIAL_PAGE_SIZE
  );

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
            {total > 0 ? (
              <GalleryGrid
                initialImages={initialImages}
                total={total}
                initialHasMore={hasMore}
                pageSize={INITIAL_PAGE_SIZE}
              />
            ) : (
              <GalleryPageClient />
            )}
          </Reveal>
        </div>
      </section>
    </div>
  );
}
