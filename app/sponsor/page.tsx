import Link from "next/link";
import {
  UserGroupIcon,
  BuildingOffice2Icon,
  HeartIcon,
  SparklesIcon,
  PhotoIcon,
  MegaphoneIcon,
  CheckBadgeIcon,
  AcademicCapIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

const whySupportValues = [
  {
    title: "Youth Empowerment",
    description: "Invest in the potential of Africa's youth.",
    icon: UserGroupIcon,
  },
  {
    title: "Nation Building",
    description: "Develop future leaders with strong ethical values.",
    icon: BuildingOffice2Icon,
  },
  {
    title: "Community Impact",
    description: "Meet your CSR goals for education and development.",
    icon: HeartIcon,
  },
  {
    title: "Faith-Driven Ethics",
    description: "Support leadership rooted in integrity and purpose.",
    icon: SparklesIcon,
  },
];

const supportBenefits = [
  {
    title: "Brand Visibility",
    description: "Prominent recognition across programme materials and events.",
    icon: PhotoIcon,
  },
  {
    title: "Direct Engagement",
    description: "Connect with student leaders and educators in the RoG SLDP community.",
    icon: UserGroupIcon,
  },
  {
    title: "Media Exposure",
    description: "Recognition in programme highlights and social media.",
    icon: MegaphoneIcon,
  },
  {
    title: "Credibility",
    description: "Public acknowledgement as a supporter of values-driven leadership.",
    icon: CheckBadgeIcon,
  },
];

const sponsorshipTiers = [
  {
    category: "Venue Support",
    investment: "Support hosting summits and gatherings at your venue.",
    benefits: [
      'Title recognition as "Official Venue Supporter"',
      "Speaking opportunity at events",
      "Logo on delegate materials",
    ],
    icon: BuildingOffice2Icon,
  },
  {
    category: "Meal Support",
    investment: "Support meals for participants at summits and events.",
    benefits: [
      "Branding at meal service points",
      "Logo on materials",
      "Verbal acknowledgement at events",
    ],
    icon: HeartIcon,
  },
  {
    category: "Sponsor a Child",
    investment: "KES 3,000 per student.",
    benefits: [
      "Recognition as a Youth Empowerment Supporter",
      "Impact report indicating the number of students supported",
    ],
    icon: BanknotesIcon,
  },
];

const programmeStructure = [
  { title: "Inspirational Keynotes", detail: "Sessions led by industry leaders.", icon: MegaphoneIcon },
  { title: "Leadership Workshops", detail: "Practical skills applicable beyond the classroom.", icon: AcademicCapIcon },
  { title: "Professional Panels", detail: "Insights from experts in Education, Health, Media, Governance, and Global Organizations.", icon: UserGroupIcon },
  { title: "Awards & Plenary", detail: "Recognizing excellence and casting vision for the future.", icon: CheckBadgeIcon },
];

export default function SponsorPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-teal-blue-dark text-white py-16 md:py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lime-green font-semibold text-sm uppercase tracking-wide mb-2">
            Support Us
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            RoG Student Leadership Development Programme
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Empowering Tomorrow&apos;s Leaders, Today
          </p>
          <p className="text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
            The River of God Church (RoG) invites you to support the Student Leadership Development Programme. We have empowered over 1,100 student leaders across growing numbers of participating schools through summits, mentorship, and year-round formation.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
              <UserGroupIcon className="w-5 h-5 text-lime-green" />
              1,100+ student leaders
            </span>
            <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
              <BuildingOffice2Icon className="w-5 h-5 text-lime-green" />
              Growing network of schools
            </span>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-12 md:py-14 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-700 text-lg leading-relaxed">
            Your support helps us equip high school prefects with value-driven leadership skills so they can positively influence their schools and society through summits, the SALT track, and ongoing mentorship.
          </p>
        </div>
      </section>

      {/* Why Support Us */}
      <section className="py-16 md:py-20 px-6 bg-teal-blue/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-teal-blue mb-8">
            Why Support Us?
          </h2>
          <p className="text-gray-700 mb-8">
            Align your brand with youth empowerment and nation-building through these core values:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {whySupportValues.map((item) => (
              <div
                key={item.title}
                className="border border-teal-blue/20 rounded-lg p-5 bg-white shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-teal-blue/10 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-teal-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-teal-blue mb-1">{item.title}</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits of Supporting */}
      <section className="py-16 md:py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-teal-blue mb-8">
            Benefits of Supporting
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {supportBenefits.map((item) => (
              <div
                key={item.title}
                className="border-l-4 border-lime-green pl-5 py-3 bg-teal-blue/5 rounded-r-lg"
              >
                <div className="flex items-center gap-2 mb-1">
                  <item.icon className="w-5 h-5 text-lime-green shrink-0" />
                  <h3 className="font-semibold text-teal-blue">{item.title}</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsorship Opportunities */}
      <section className="py-16 md:py-20 px-6 bg-teal-blue/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-teal-blue mb-4">
            Sponsorship Opportunities
          </h2>
          <p className="text-gray-700 mb-8">
            Your support has a direct impact on student leaders and the programme experience.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {sponsorshipTiers.map((tier) => (
              <div
                key={tier.category}
                className="border border-teal-blue/20 rounded-xl p-6 bg-white shadow-sm flex flex-col"
              >
                <div className="w-12 h-12 rounded-lg bg-teal-blue/10 flex items-center justify-center mb-4">
                  <tier.icon className="w-7 h-7 text-teal-blue" />
                </div>
                <h3 className="text-lg font-bold text-teal-blue mb-2">{tier.category}</h3>
                <p className="text-sm text-gray-600 mb-4 font-medium">{tier.investment}</p>
                <p className="text-xs font-semibold text-teal-blue uppercase tracking-wide mb-2">
                  Key Benefits
                </p>
                <ul className="space-y-2 flex-1">
                  {tier.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckBadgeIcon className="w-4 h-4 text-lime-green shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programme Elements */}
      <section className="py-16 md:py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-teal-blue mb-4">
            What Your Support Enables
          </h2>
          <p className="text-gray-700 mb-8">
            Your support helps deliver a comprehensive experience of growth, including:
          </p>
          <div className="space-y-4">
            {programmeStructure.map((item) => (
              <div
                key={item.title}
                className="border border-teal-blue/20 rounded-lg p-4 bg-teal-blue/5 flex items-start gap-4"
              >
                <div className="shrink-0 w-10 h-10 rounded-lg bg-teal-blue/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-teal-blue" />
                </div>
                <div>
                  <h3 className="font-semibold text-teal-blue">{item.title}</h3>
                  <p className="text-gray-700 text-sm mt-1">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Get In Touch */}
      <section className="py-16 md:py-20 px-6 bg-teal-blue-dark text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Get In Touch
          </h2>
          <p className="text-white/90 mb-8">
            Ready to make an impact? Contact us to discuss how you can support:
          </p>
          <div className="grid sm:grid-cols-1 gap-6 mb-8">
            <a
              href="mailto:info@rogchurchkenya.org"
              className="flex items-center gap-3 p-4 rounded-lg bg-white/10 hover:bg-white/15 transition"
            >
              <EnvelopeIcon className="w-6 h-6 text-lime-green shrink-0" />
              <div>
                <span className="text-xs text-white/70 uppercase tracking-wide">Email</span>
                <p className="font-medium">info@rogchurchkenya.org</p>
              </div>
            </a>
            <a
              href="tel:+254721274487"
              className="flex items-center gap-3 p-4 rounded-lg bg-white/10 hover:bg-white/15 transition"
            >
              <PhoneIcon className="w-6 h-6 text-lime-green shrink-0" />
              <div>
                <span className="text-xs text-white/70 uppercase tracking-wide">Phone</span>
                <p className="font-medium">+254 721 274 487</p>
              </div>
            </a>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-white/10">
              <MapPinIcon className="w-6 h-6 text-lime-green shrink-0" />
              <div>
                <span className="text-xs text-white/70 uppercase tracking-wide">Location</span>
                <p className="font-medium">Parklands (Ojijo Road), Nairobi</p>
              </div>
            </div>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold bg-lime-green text-white hover:opacity-90 transition"
          >
            Contact us to support
          </Link>
        </div>
      </section>
    </div>
  );
}
