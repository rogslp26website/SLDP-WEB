"use client";

import { useState } from "react";
import Reveal from "@/components/motion/Reveal";

const ROLE_OPTIONS = [
  "Student Leader",
  "Teacher / School Coordinator",
  "Facilitating mentor",
  "Ministry Volunteer",
  "Alumni",
  "Partner School",
  "Sponsor / Supporter",
  "Other (state)",
];

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-lime-green focus:border-lime-green";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [schoolOrg, setSchoolOrg] = useState("");
  const [role, setRole] = useState("");
  const [roleOther, setRoleOther] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          school_organization: schoolOrg.trim(),
          role: role.trim(),
          role_other: role === "Other (state)" ? roleOther.trim() || null : null,
          phone: phone.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to send. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again or email us directly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
      <Reveal>
        <h1 className="text-3xl font-bold text-teal-blue mb-2">Contact Us</h1>
        <p className="text-gray-600 mb-4">Interested in joining RoG SLDP?</p>
        <p className="text-gray-700 mb-2">
          We would love to connect with you. Please write to us by providing:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-2 space-y-0.5">
          <li>Your full name</li>
          <li>School / organization</li>
          <li>Role (Student Leader / Teacher-Coordinator / Volunteer / Alumni / Partner School / Sponsor)</li>
          <li>Phone number and email</li>
          <li>Your message or inquiry</li>
        </ul>
        <p className="text-gray-700 mb-8">
          Our team will respond and guide you on the next steps.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-teal-blue mb-3">Our Location</h2>
          <p className="text-gray-700 mb-2">
            R.O.G Church is located along Chiromo Lane, off Ojijo Road.
          </p>
          <p className="text-gray-700 mb-2">
            Box 39733-000623 Parklands, Nairobi Kenya
          </p>
          <a
            href="https://www.google.com/maps/place/The+River+Of+God+Church,+Parklands"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lime-green font-medium hover:underline"
          >
            View on Google Maps
          </a>
        </section>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="grid sm:grid-cols-2 gap-8 mb-10">
          <div>
            <h2 className="font-semibold text-teal-blue mb-2">Email</h2>
            <a
              href="mailto:info@rogsldp.com"
              className="text-lime-green hover:underline"
            >
              info@rogsldp.com
            </a>
          </div>
          <div>
            <h2 className="font-semibold text-teal-blue mb-2">Enquiries</h2>
            <p className="text-gray-700 text-sm">
              For programme details, registration, or resources, use the form or email above.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <h2 className="text-xl font-semibold text-teal-blue mb-4">Contact RoG SLDP</h2>
        {submitted ? (
          <p className="text-lime-green bg-lime-green/10 px-4 py-3 rounded-lg">
            Thank you for reaching out to RoG SLP. We have received your message and will get back to you shortly.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded">{error}</p>
            )}
            <div>
              <label htmlFor="contact-name" className={labelClass}>
                Full Name *
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., Jane Wanjiku"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="contact-school" className={labelClass}>
                School / Organization *
              </label>
              <input
                id="contact-school"
                name="school"
                type="text"
                required
                value={schoolOrg}
                onChange={(e) => setSchoolOrg(e.target.value)}
                placeholder="e.g., St. Mary's School, Nairobi / River of God Church"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="contact-role" className={labelClass}>
                Role / Interest Area *
              </label>
              <select
                id="contact-role"
                name="role"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={inputClass}
              >
                <option value="">— Select —</option>
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {role === "Other (state)" && (
                <input
                  type="text"
                  value={roleOther}
                  onChange={(e) => setRoleOther(e.target.value)}
                  placeholder="Please state your role"
                  className={`${inputClass} mt-2`}
                />
              )}
            </div>
            <div>
              <label htmlFor="contact-phone" className={labelClass}>
                Phone Number *
              </label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="e.g. 0722123456"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="contact-email" className={labelClass}>
                Email Address *
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., name@email.com"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="contact-message" className={labelClass}>
                Message / Inquiry *
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us how you would like to engage with RoG SLDP, or share your question…"
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg font-semibold bg-lime-green text-white hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-60 transition"
            >
              {loading ? "Sending…" : "Send Message"}
            </button>
          </form>
        )}
      </Reveal>
    </div>
  );
}
