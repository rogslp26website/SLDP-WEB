import Image from "next/image";
import { homeIntroTitle, homeIntro } from "@/lib/homeContent";
import MissionVisionWithStats from "@/components/MissionVisionWithStats";
import Reveal from "@/components/motion/Reveal";

function ContentPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-teal-blue-dark/85 backdrop-blur-md border border-white/25 shadow-2xl px-6 py-8 md:px-10 md:py-10 ${className}`}
    >
      {children}
    </div>
  );
}

export default function HomeAboutSection() {
  return (
    <>
      <section className="relative py-16 md:py-24 px-6 overflow-hidden">
        <Image
          src="/hero/primary.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority={false}
        />
        <div className="absolute inset-0 bg-black/50" aria-hidden />

        <div className="relative z-10 max-w-4xl mx-auto">
          <Reveal>
            <ContentPanel>
              <h2 className="text-2xl md:text-3xl font-bold text-lime-green mb-6 text-center drop-shadow-sm">
                {homeIntroTitle}
              </h2>
              <p className="text-lg text-white leading-relaxed text-center max-w-3xl mx-auto drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
                {homeIntro}
              </p>
            </ContentPanel>
          </Reveal>
        </div>
      </section>

      <MissionVisionWithStats />
    </>
  );
}
