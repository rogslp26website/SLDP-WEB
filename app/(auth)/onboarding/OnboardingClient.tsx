"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const ROLES = [
  { value: "student_leader", label: "Student Leader" },
  { value: "salt_coordinator", label: "SALT Coordinator" },
  { value: "facilitator", label: "SALT Facilitator/Mentor" },
  { value: "volunteer", label: "Volunteer" },
  { value: "panelist", label: "Panelist" },
  { value: "other", label: "Other" },
] as const;

const HOW_HEARD_OPTIONS = [
  "Referral",
  "Internet search",
  "Social media",
  "School / institution",
  "Other",
];

interface School {
  id: string;
  name: string;
}

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-lime-green focus:border-lime-green";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

export default function OnboardingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<string>("");
  const [schoolId, setSchoolId] = useState("");
  const [county, setCounty] = useState("");
  const [phone, setPhone] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [almaMater, setAlmaMater] = useState("");
  const [howHeard, setHowHeard] = useState("");
  const [howHeardOther, setHowHeardOther] = useState("");
  const [availabilityNotes, setAvailabilityNotes] = useState("");
  const [priorNoticeDuration, setPriorNoticeDuration] = useState("");
  const [fieldOfPractice, setFieldOfPractice] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile?.onboarding_completed_at) {
          router.replace(nextPath);
          return;
        }
        if (data.profile) {
          setFullName(data.profile.full_name || "");
          setRole(data.profile.role || "");
          setSchoolId(data.profile.school_id || "");
          setCounty(data.profile.county || "");
          setPhone(data.profile.phone || "");
          setAlmaMater(data.profile.alma_mater || "");
          setHowHeard(data.profile.how_heard || "");
          setAvailabilityNotes(data.profile.availability_notes || "");
          setPriorNoticeDuration(data.profile.prior_notice_duration || "");
          setFieldOfPractice(data.profile.field_of_practice || "");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router, nextPath]);

  useEffect(() => {
    if (role === "student_leader" || role === "salt_coordinator") {
      fetch("/api/schools")
        .then((r) => r.json())
        .then((data) => setSchools(Array.isArray(data) ? data : []))
        .catch(() => setSchools([]));
    }
  }, [role]);

  const needsSchool = role === "student_leader" || role === "salt_coordinator";
  const needsPreferences = role === "volunteer" || role === "mentor" || role === "panelist" || role === "facilitator";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName.trim(),
        role,
        school_id: needsSchool ? schoolId || null : null,
        county: county.trim() || null,
        phone: phone.trim() || null,
        alma_mater: needsPreferences ? almaMater.trim() || null : null,
        how_heard: needsPreferences ? (howHeard === "Other" ? howHeardOther.trim() || "Other" : howHeard || null) : null,
        availability_notes: needsPreferences ? availabilityNotes.trim() || null : null,
        prior_notice_duration: needsPreferences ? priorNoticeDuration.trim() || null : null,
        field_of_practice: (role === "mentor" || role === "panelist") ? fieldOfPractice.trim() || null : null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "Failed to save.");
      return;
    }
    router.replace(nextPath);
    router.refresh();
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-6 py-12 text-center text-gray-600">
        Loading…
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-teal-blue mb-2">Complete your profile</h1>
      <p className="text-gray-600 mb-6">
        Tell us who you are so we can tailor your experience and use this information during the selection process.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded">{error}</p>
        )}

        <div>
          <label htmlFor="full_name" className={labelClass}>Full name *</label>
          <input
            id="full_name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Role *</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={inputClass}
            required
          >
            <option value="">— Select your role —</option>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {needsSchool && (
          <div>
            <label className={labelClass}>School *</label>
            <select
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              className={inputClass}
              required
            >
              <option value="">— Select your school —</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Only partner schools are listed. Your school must be registered to appear here.
            </p>
          </div>
        )}

        <div>
          <label htmlFor="county" className={labelClass}>County / Region</label>
          <input
            id="county"
            type="text"
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            className={inputClass}
            placeholder="e.g. Nairobi"
          />
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>Phone</label>
          <input
            id="phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className={inputClass}
          />
        </div>

        {needsPreferences && (
          <>
            <div>
              <label htmlFor="alma_mater" className={labelClass}>Alma mater (high school)</label>
              <input
                id="alma_mater"
                type="text"
                value={almaMater}
                onChange={(e) => setAlmaMater(e.target.value)}
                className={inputClass}
                placeholder="High school name"
              />
            </div>
            {(role === "mentor" || role === "panelist") && (
              <div>
                <label htmlFor="field_of_practice" className={labelClass}>Field of practice</label>
                <input
                  id="field_of_practice"
                  type="text"
                  value={fieldOfPractice}
                  onChange={(e) => setFieldOfPractice(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Engineering, Medicine"
                />
              </div>
            )}
            <div>
              <label htmlFor="how_heard" className={labelClass}>How did you hear about the programme?</label>
              <select
                id="how_heard"
                value={howHeard}
                onChange={(e) => setHowHeard(e.target.value)}
                className={inputClass}
              >
                <option value="">— Select —</option>
                {HOW_HEARD_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {howHeard === "Other" && (
                <input
                  type="text"
                  value={howHeardOther}
                  onChange={(e) => setHowHeardOther(e.target.value)}
                  placeholder="Please specify"
                  className={`${inputClass} mt-1`}
                />
              )}
            </div>
            <div>
              <label htmlFor="availability_notes" className={labelClass}>
                {role === "panelist" ? "Availability for speaking engagements" : role === "mentor" ? "Availability for mentorship" : "Availability for engagements"}
              </label>
              <textarea
                id="availability_notes"
                value={availabilityNotes}
                onChange={(e) => setAvailabilityNotes(e.target.value)}
                className={inputClass}
                rows={2}
                placeholder="e.g. Weekday evenings, weekends"
              />
            </div>
            <div>
              <label htmlFor="prior_notice_duration" className={labelClass}>Notice period required</label>
              <input
                id="prior_notice_duration"
                type="text"
                value={priorNoticeDuration}
                onChange={(e) => setPriorNoticeDuration(e.target.value)}
                className={inputClass}
                placeholder="e.g. 2 weeks, 1 month"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-lg font-semibold bg-lime-green text-white hover:opacity-90 disabled:opacity-60 transition"
        >
          {submitting ? "Saving…" : "Continue"}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600 text-left">
        <Link href="/sign-in" className="text-lime-green font-medium hover:underline">
          Sign out
        </Link>
      </p>
    </div>
  );
}
