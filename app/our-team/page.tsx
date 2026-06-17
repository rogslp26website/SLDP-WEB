import { PageHero, PageSection } from "@/components/PageSection";
import Reveal from "@/components/motion/Reveal";
import BrandMotif from "@/components/BrandMotif";

const EXPLAINER =
  "The River of God Student Leadership Development Program (ROGSLDP) is stewarded by a multidisciplinary team of pastors, educators, professionals, and volunteers united by a shared calling to raise values-driven student leaders.";

const TEAM = [
  { name: "Rev. Carol", role: "Program Director", responsibilities: "Provides overall spiritual and strategic leadership for ROGSLDP; safeguards the vision, values, and mission of the program; offers pastoral oversight; ensures alignment with River of God Church mandate; provides final approval on program direction and partnerships.", tooltip: "Program Director and vision bearer providing spiritual oversight, strategic direction, and alignment with River of God Church." },
  { name: "Sylvia Michuli", role: "Advisory (Deacon Board Member)", responsibilities: "Provides advisory oversight; supports governance, accountability, and strategic alignment with church leadership.", tooltip: "Founder and advisory leader providing governance support and strategic guidance." },
  { name: "Mathias Mbogori", role: "Program Coordinator", responsibilities: "Oversees day-to-day program operations; coordinates school engagements, facilitators, and program schedules; ensures smooth execution of activities; serves as the primary link between the Program Director, facilitators, and partner schools.", tooltip: "Coordinates day-to-day program implementation, school engagements, and facilitator support." },
  { name: "Pastor Bill Dindi", role: "Youth Minister & Partner Schools Onboarding Lead", responsibilities: "Leads youth mentorship and discipleship; champions the ROGSLDP vision to schools and stakeholders; onboards partner schools; engages school leadership; communicates program value; supports school commitment and continuity; guides spiritual formation of student leaders.", tooltip: "Leads youth mentorship and partners school onboarding; champions the ROGSLDP vision to schools and stakeholders." },
  { name: "Pastor Grace", role: "Mission & Outreach Lead", responsibilities: "Oversees outreach initiatives; strengthens community and mission partnerships; ensures the program reflects Christ-centered service; supports expansion into new schools and communities.", tooltip: "Oversees mission and outreach, strengthening community partnerships and faith-based service impact." },
  { name: "Emily Njeru", role: "Strategy, Curriculum & Training Designer", responsibilities: "Designs program strategy, curriculum frameworks, and training models (SALT & CALM); structures facilitator and coordinator roles; supports monitoring, learning, and continuous improvement; aligns program delivery with leadership development outcomes.", tooltip: "Designs program strategy, curriculum, and training frameworks to support leadership formation and growth." },
  { name: "Joseph Choge", role: "Strategy & Corporate Liaison", responsibilities: "Engages corporate partners, industry leaders, and sponsors; secures panelists, mentors, and professional exposure for students; supports sustainability strategy and resource mobilization.", tooltip: "Leads corporate engagement, sponsorships, and industry partnerships to support program sustainability." },
  { name: "Cliff White", role: "Public Relations, Creative & Social Media Lead", responsibilities: "Manages branding, communications, and digital presence; oversees website content, storytelling, and engagement; supports visibility and public awareness of ROGSLDP.", tooltip: "Leads public relations, branding, creative content, and social media engagement." },
  { name: "TJ Kiama", role: "Logistics Coordinator", responsibilities: "Manages logistics for school visits, summits, trainings, and events; coordinates venues, materials, and transport; supports smooth operational execution.", tooltip: "Manages logistics for school visits, summits, and program activities." },
  { name: "Gatetei", role: "Media & Documentation", responsibilities: "Provides photography and videography; documents school engagements and events; supports content creation and archival storytelling.", tooltip: "Handles media documentation including photography and videography for events and programs." },
  { name: "Naomi Nyakinyua", role: "Program Secretary", responsibilities: "Maintains records and documentation; takes and archives minutes; supports internal communication; tracks follow-ups and administrative coordination.", tooltip: "Oversees documentation, records, minutes, and administrative coordination." },
];

export default function OurTeamPage() {
  return (
    <div>
      <PageHero>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Meet the ROGSLDP Team
        </h1>
        <p className="text-lg text-white/90">{EXPLAINER}</p>
      </PageHero>

      <PageSection className="bg-teal-blue/5">
        <div className="space-y-12">
          {TEAM.map((member, i) => (
            <Reveal key={i} delay={(i % 4) * 0.08}>
              <article className="border-l-4 border-lime-green pl-5 py-2 bg-white rounded-r-lg shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="shrink-0">
                    <div
                      className="w-32 h-32 sm:w-40 sm:h-40 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 text-sm text-center"
                      aria-hidden
                    >
                      Photo
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-semibold text-teal-blue mb-1">
                      {member.name}
                    </h2>
                    <p className="text-lime-green font-medium text-sm mb-3">
                      {member.role}
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      {member.responsibilities}
                    </p>
                    <p className="text-sm text-gray-500 mt-2" title={member.tooltip}>
                      {member.tooltip}
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </PageSection>

      <section className="relative overflow-hidden py-16 px-6 bg-brand-motif">
        <BrandMotif />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <Reveal>
            <a
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold bg-lime-green text-white hover:opacity-90 transition-all duration-300 hover:-translate-y-0.5"
            >
              Back to Home
            </a>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
