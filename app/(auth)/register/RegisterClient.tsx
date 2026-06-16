"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Role = "student" | "teacher" | "panelist" | "mentor" | "volunteer";

interface School {
  id: string;
  name: string;
  principal?: string | null;
  salt_coordinator_name?: string | null;
  salt_coordinator_contacts?: string | null;
}

export interface RegisterProfile {
  role: string;
  full_name: string;
}

const ROLES: { value: Role; label: string; title: string }[] = [
  { value: "student", label: "Student Leader", title: "Student" },
  { value: "teacher", label: "SALT Coordinator", title: "School teacher/appointee" },
  { value: "panelist", label: "Panelist", title: "Panelist" },
  { value: "mentor", label: "SALT Facilitator", title: "Mentoring volunteer" },
  { value: "volunteer", label: "RoG SLDP Ministry Volunteer", title: "Ministry volunteer" },
];

const HOW_HEARD_OPTIONS = [
  "Referral",
  "Internet search",
  "Social media",
  "School / institution",
  "Other",
];

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-lime-green focus:border-lime-green";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

const PROGRAMME_ROLES = ["student_leader", "salt_coordinator", "facilitator"];

export default function RegisterClient({
  profile,
  initialEmail = "",
}: {
  profile: RegisterProfile | null;
  initialEmail?: string;
}) {
  const router = useRouter();
  const canJoinProgramme = profile && PROGRAMME_ROLES.includes(profile.role);

  const [role, setRole] = useState<Role | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolLoading, setSchoolLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState("");
  const [grade, setGrade] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [principalContact, setPrincipalContact] = useState("");
  const [saltCoordinatorDisplay, setSaltCoordinatorDisplay] = useState("");

  useEffect(() => {
    setEmail((prev) => (initialEmail ? initialEmail : prev));
  }, [initialEmail]);
  const [almaMater, setAlmaMater] = useState("");
  const [fieldOfPractice, setFieldOfPractice] = useState("");
  const [howHeard, setHowHeard] = useState("");
  const [howHeardOther, setHowHeardOther] = useState("");
  const [availabilitySpeaking, setAvailabilitySpeaking] = useState("");
  const [availabilityMentorship, setAvailabilityMentorship] = useState("");
  const [priorNoticeDuration, setPriorNoticeDuration] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const needsSchool = role === "student" || role === "teacher";

  useEffect(() => {
    if (!needsSchool) return;
    setSchoolLoading(true);
    fetch("/api/schools")
      .then((r) => r.json())
      .then((data) => {
        setSchools(Array.isArray(data) ? data : []);
      })
      .catch(() => setSchools([]))
      .finally(() => setSchoolLoading(false));
  }, [needsSchool]);

  function onSchoolChange(newSchoolId: string) {
    setSchoolId(newSchoolId);
    if (!newSchoolId) {
      setPrincipalContact("");
      setSaltCoordinatorDisplay("");
      return;
    }
    const school = schools.find((s) => s.id === newSchoolId);
    if (school) {
      const principal = school.principal ?? "";
      setPrincipalContact(principal.replace(/\D/g, "").slice(0, 10));
      const name = school.salt_coordinator_name ?? "";
      const contacts = school.salt_coordinator_contacts ?? "";
      setSaltCoordinatorDisplay([name, contacts].filter(Boolean).join(contacts ? " · " : ""));
    } else {
      setPrincipalContact("");
      setSaltCoordinatorDisplay("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload: Record<string, unknown> = {
      role,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      principal_contact: principalContact.trim() || undefined,
    };

    if (role === "student" || role === "teacher") {
      if (!schoolId) {
        setError("Please select your partner school from the list.");
        setLoading(false);
        return;
      }
      payload.school_id = schoolId;
      if (role === "student") {
        if (!grade.trim()) {
          setError("Grade is required.");
          setLoading(false);
          return;
        }
        payload.grade = grade.trim();
      }
    }

    if (role === "panelist" || role === "mentor" || role === "volunteer") {
      payload.alma_mater = almaMater.trim() || undefined;
      payload.how_heard = howHeard === "Other" ? howHeardOther.trim() || "Other" : howHeard || undefined;
      payload.availability_speaking = availabilitySpeaking.trim() || undefined;
      payload.availability_mentorship = availabilityMentorship.trim() || undefined;
      payload.prior_notice_duration = priorNoticeDuration.trim() || undefined;
      if (role !== "volunteer") payload.field_of_practice = fieldOfPractice.trim() || undefined;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Registration failed.");
      return;
    }
    if (role === "student" || role === "teacher") {
      router.push("/portal");
      router.refresh();
    } else {
      router.push("/register?success=1");
    }
  }

  // Profile is volunteer or other: no access to programme registration or materials
  if (profile && !canJoinProgramme) {
    const roleLabel = profile.role === "volunteer" ? "Volunteer" : profile.role === "other" ? "Other" : profile.role;
    return (
      <div className="max-w-lg mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-teal-blue mb-4">Register in programme</h1>
        <p className="text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
          Programme registration and access to materials are for student leaders, SALT coordinators, and facilitators. You are registered as <strong>{roleLabel}</strong>. Volunteers and other roles do not have access to programme materials.
        </p>
        <p className="text-gray-600">
          <Link href="/contact" className="text-lime-green font-medium hover:underline">Contact us</Link> if you need to change your role or have questions.
        </p>
      </div>
    );
  }

  if (role === null) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-teal-blue mb-6">Register</h1>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-teal-blue mb-3">Why Register?</h2>
          <p className="text-gray-700 mb-3 leading-relaxed">
            Registration is open to partner schools officially enrolled in the program, and it enables RoG SLDP to serve you with excellence, accountability, and continuity.
          </p>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Registration helps the River of God Student Leadership Development Programme (RoG SLDP) to support you beyond the Summit and walk with you through a structured, long-term leadership journey.
          </p>
          <p className="text-gray-700 mb-2 leading-relaxed">By registering, your school and student leaders become part of a year-round program that includes:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm mb-4">
            <li>Ongoing mentorship and follow-up through trained facilitators and coordinators</li>
            <li>Participation in the SALT Track (Servant • Action • Leadership • Transformation)</li>
            <li>Access to leadership tools, resources, and activity guides</li>
            <li>Better coordination between the RoG SLDP Hub, partner schools, facilitators, and coordinators</li>
            <li>Tracking of growth and impact using the CALM model (Character, Action, Leadership, Mission)</li>
            <li>A pathway for student leaders to grow into the RoG SLDP Community Circle as alumni, mentors, volunteers, and future leaders/panelists</li>
          </ul>
        </section>

        <p className="text-gray-600 mb-2">Choose your role to continue.</p>
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
          Note: Only student leaders from signed-up partner schools can register as Student Leader.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              className="group py-4 px-4 rounded-lg border-2 border-teal-blue/30 text-teal-blue font-medium hover:bg-teal-blue/10 hover:border-teal-blue transition text-center min-h-[3.5rem]"
            >
              <span className="inline group-hover:hidden">{r.label}</span>
              <span className="hidden group-hover:inline">{r.title}</span>
            </button>
          ))}
        </div>
        <p className="mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-lime-green font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <button
        type="button"
        onClick={() => setRole(null)}
        className="text-sm text-teal-blue hover:underline mb-4"
      >
        ← Change role
      </button>
      <h1 className="text-2xl font-bold text-teal-blue mb-6">
        Register as {ROLES.find((r) => r.value === role)?.label}
      </h1>

      {role === "student" && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
          Note: Only student leaders from signed-up partner schools can register.
        </p>
      )}

      {typeof window !== "undefined" && new URLSearchParams(window.location.search).get("success") === "1" && (
        <p className="mb-4 text-sm text-lime-green bg-lime-green/10 px-3 py-2 rounded">
          Thank you for registering. We will be in touch.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded">{error}</p>
        )}

        <div>
          <label htmlFor="name" className={labelClass}>Name *</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        {needsSchool && (
          <div>
            <label className={labelClass}>School *</label>
            {schoolLoading ? (
              <p className="text-sm text-gray-500">Loading schools…</p>
            ) : (
              <select
                value={schoolId}
                onChange={(e) => onSchoolChange(e.target.value)}
                className={inputClass}
                required
              >
                <option value="">— Select your partner school —</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {role === "student" && (
          <div>
            <label htmlFor="grade" className={labelClass}>Grade *</label>
            <input
              id="grade"
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className={inputClass}
              placeholder="e.g. 10"
              required
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className={labelClass}>Email *</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone {role === "teacher" ? "" : "(optional)"}
          </label>
          <input
            id="phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className={inputClass}
            required={role === "teacher"}
          />
        </div>

        {needsSchool && (
          <>
            <div>
              <label htmlFor="principal" className={labelClass}>Principal contact (phone, 10 digits)</label>
              <input
                id="principal"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={principalContact}
                onChange={(e) => setPrincipalContact(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className={inputClass}
                placeholder="e.g. 0722123456"
              />
            </div>
            {saltCoordinatorDisplay && (
              <div>
                <span className={labelClass}>SALT Coordinator</span>
                <p className="text-sm text-gray-700 mt-1">{saltCoordinatorDisplay}</p>
              </div>
            )}
          </>
        )}

        {(role === "panelist" || role === "mentor" || role === "volunteer") && (
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
            {role !== "volunteer" && (
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
            {role === "panelist" && (
              <>
                <div>
                  <label htmlFor="availability_speaking" className={labelClass}>Availability for speaking engagements</label>
                  <textarea
                    id="availability_speaking"
                    value={availabilitySpeaking}
                    onChange={(e) => setAvailabilitySpeaking(e.target.value)}
                    className={inputClass}
                    rows={2}
                    placeholder="e.g. Weekday evenings, weekends"
                  />
                </div>
                <div>
                  <label htmlFor="prior_notice" className={labelClass}>Duration of prior notice required</label>
                  <input
                    id="prior_notice"
                    type="text"
                    value={priorNoticeDuration}
                    onChange={(e) => setPriorNoticeDuration(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. 2 weeks, 1 month"
                  />
                </div>
              </>
            )}
            {role === "mentor" && (
              <>
                <div>
                  <label htmlFor="availability_mentorship" className={labelClass}>Availability for mentorship sessions</label>
                  <textarea
                    id="availability_mentorship"
                    value={availabilityMentorship}
                    onChange={(e) => setAvailabilityMentorship(e.target.value)}
                    className={inputClass}
                    rows={2}
                    placeholder="e.g. Weekday evenings"
                  />
                </div>
                <div>
                  <label htmlFor="prior_notice_m" className={labelClass}>Duration of prior notice required</label>
                  <input
                    id="prior_notice_m"
                    type="text"
                    value={priorNoticeDuration}
                    onChange={(e) => setPriorNoticeDuration(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. 2 weeks"
                  />
                </div>
              </>
            )}
            {role === "volunteer" && (
              <>
                <div>
                  <label htmlFor="availability_vol" className={labelClass}>Availability for engagements</label>
                  <textarea
                    id="availability_vol"
                    value={availabilitySpeaking}
                    onChange={(e) => setAvailabilitySpeaking(e.target.value)}
                    className={inputClass}
                    rows={2}
                    placeholder="e.g. Weekends"
                  />
                </div>
                <div>
                  <label htmlFor="prior_notice_v" className={labelClass}>Duration of prior notice required</label>
                  <input
                    id="prior_notice_v"
                    type="text"
                    value={priorNoticeDuration}
                    onChange={(e) => setPriorNoticeDuration(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. 1 week"
                  />
                </div>
              </>
            )}
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg font-semibold bg-lime-green text-white hover:opacity-90 disabled:opacity-60 transition"
        >
          {loading ? "Submitting…" : "Submit registration"}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-lime-green font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
