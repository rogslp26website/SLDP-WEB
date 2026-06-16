"use client";

import { useState } from "react";
import { CalendarPlus, Plus, X } from "lucide-react";

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_end_date: string | null;
  event_time?: string | null;
  event_end_time?: string | null;
  participants?: string | null;
  scope: string;
  created_at: string;
  school_ids: string[];
  facilitator_ids?: string[];
};
type SchoolRow = { id: string; name: string };
type FacilitatorRow = { id: string; name: string; email?: string | null; phone?: string | null };

function toICSDate(d: string): string {
  const date = new Date(d);
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function downloadICS(ev: EventRow) {
  const start = toICSDate(ev.event_date);
  const end = ev.event_end_date ? toICSDate(ev.event_end_date) : start;
  const desc = (ev.description || "").replace(/\r?\n/g, "\\n");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RoG SLDP//Calendar//EN",
    "BEGIN:VEVENT",
    `UID:${ev.id}@rog-sldp`,
    `DTSTAMP:${toICSDate(new Date().toISOString())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${ev.title.replace(/,/g, "\\,").replace(/;/g, "\\;")}`,
    desc ? `DESCRIPTION:${desc}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${ev.title.replace(/[^a-z0-9]/gi, "_")}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function MonthCalendar({
  events,
  month,
  onMonthChange,
  onDayClick,
  onEventClick,
  schools,
  facilitators,
}: {
  events: EventRow[];
  month: { year: number; month: number };
  onMonthChange: (m: { year: number; month: number }) => void;
  onDayClick: (dateStr: string, dayEvents: EventRow[]) => void;
  onEventClick: (ev: EventRow) => void;
  schools: SchoolRow[];
  facilitators: FacilitatorRow[];
}) {
  const first = new Date(month.year, month.month, 1);
  const last = new Date(month.year, month.month + 1, 0);
  const startPad = first.getDay();
  const daysInMonth = last.getDate();
  const totalCells = startPad + daysInMonth;
  const rowCount = Math.ceil(totalCells / 7);
  const eventsByDate: Record<string, EventRow[]> = {};
  events.forEach((ev) => {
    const d = ev.event_date;
    if (!eventsByDate[d]) eventsByDate[d] = [];
    eventsByDate[d].push(ev);
  });
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => onMonthChange(month.month === 0 ? { year: month.year - 1, month: 11 } : { year: month.year, month: month.month - 1 })}
          className="px-2 py-1 text-sm text-teal-blue hover:bg-gray-100 rounded"
        >
          ←
        </button>
        <span className="font-medium">
          {first.toLocaleString("default", { month: "long" })} {month.year}
        </span>
        <button
          type="button"
          onClick={() => onMonthChange(month.month === 11 ? { year: month.year + 1, month: 0 } : { year: month.year, month: month.month + 1 })}
          className="px-2 py-1 text-sm text-teal-blue hover:bg-gray-100 rounded"
        >
          →
        </button>
      </div>
      <table className="w-full border-collapse text-sm table-fixed">
        <thead>
          <tr>
            {DAYS.map((d) => (
              <th key={d} className="border border-gray-200 p-1 text-center font-medium text-gray-600">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }).map((_, row) => (
            <tr key={row} className="h-[90px]">
              {Array.from({ length: 7 }).map((_, col) => {
                const cellIndex = row * 7 + col;
                const dayNum = cellIndex - startPad + 1;
                const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;
                const dateStr = isCurrentMonth ? `${month.year}-${String(month.month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}` : "";
                const dayEvents = dateStr ? eventsByDate[dateStr] ?? [] : [];
                return (
                  <td
                    key={col}
                    className="border border-gray-200 align-top p-1 h-[90px] bg-white overflow-hidden"
                  >
                    {isCurrentMonth && (
                      <div
                        className="h-full flex flex-col cursor-pointer hover:bg-gray-50 rounded"
                        onClick={() => onDayClick(dateStr, dayEvents)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onDayClick(dateStr, dayEvents);
                          }
                        }}
                      >
                        <div className="text-right text-gray-600 font-medium shrink-0">{dayNum}</div>
                        <ul className="mt-0.5 space-y-0.5 overflow-y-auto flex-1 min-h-0 text-xs">
                          {dayEvents.slice(0, 4).map((ev) => {
                            const schoolNames = (ev.school_ids || [])
                              .map((id) => schools.find((s) => s.id === id)?.name)
                              .filter(Boolean) as string[];
                            const facNames = (ev.facilitator_ids || [])
                              .map((id) => facilitators.find((f) => f.id === id)?.name)
                              .filter(Boolean) as string[];
                            const sub = [schoolNames.length ? schoolNames.join(", ") : null, ev.title, facNames.length ? facNames.join(", ") : null].filter(Boolean).join(" / ");
                            return (
                              <li
                                key={ev.id}
                                className="truncate bg-teal-blue/10 text-teal-blue px-1 rounded hover:bg-teal-blue/20 text-xs"
                                title={sub}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEventClick(ev);
                                }}
                              >
                                {ev.event_time ? ev.event_time.slice(0, 5) + " " : ""}{ev.title}
                                {(schoolNames.length > 0 || facNames.length > 0) && (
                                  <span className="text-gray-500"> · {schoolNames.length ? schoolNames[0] : ""}{schoolNames.length && facNames.length ? " / " : ""}{facNames.length ? facNames[0] : ""}</span>
                                )}
                              </li>
                            );
                          })}
                          {dayEvents.length > 4 && (
                            <li
                              className="text-gray-500 shrink-0 cursor-default"
                              onClick={(e) => e.stopPropagation()}
                            >
                              +{dayEvents.length - 4}
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EventDetailBlock({
  event,
  schools,
  facilitators,
  onEdit,
  onDelete,
  onBack,
}: {
  event: EventRow;
  schools: SchoolRow[];
  facilitators: FacilitatorRow[];
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}) {
  const schoolNames = (event.school_ids || [])
    .map((id) => schools.find((s) => s.id === id)?.name)
    .filter(Boolean) as string[];
  const facilitatorNames = (event.facilitator_ids || [])
    .map((id) => facilitators.find((f) => f.id === id)?.name)
    .filter(Boolean) as string[];
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xl font-semibold text-teal-blue">{event.title}</h3>
          <button type="button" onClick={onBack} className="text-sm text-gray-500 hover:underline">
            ← Back to list
          </button>
        </div>
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            <span className="font-medium text-gray-700">Date:</span>{" "}
            {new Date(event.event_date).toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "long", day: "numeric" })}
            {event.event_end_date && event.event_end_date !== event.event_date && (
              <> – {new Date(event.event_end_date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</>
            )}
          </p>
          {(event.event_time || event.event_end_time) && (
            <p>
              <span className="font-medium text-gray-700">Time:</span>{" "}
              {event.event_time ? event.event_time.slice(0, 5) : "—"}
              {event.event_end_time ? ` – ${event.event_end_time.slice(0, 5)}` : ""}
            </p>
          )}
          <p>
            <span className="font-medium text-gray-700">Scope:</span>{" "}
            {event.scope === "general" ? "General (all schools)" : `Specific schools (${(event.school_ids || []).length})`}
          </p>
          {event.scope === "schools" && schoolNames.length > 0 && (
            <p>
              <span className="font-medium text-gray-700">Schools:</span> {schoolNames.join(", ")}
            </p>
          )}
          {facilitatorNames.length > 0 && (
            <p>
              <span className="font-medium text-gray-700">Facilitators:</span> {facilitatorNames.join(", ")}
            </p>
          )}
          {event.description && (
            <div>
              <span className="font-medium text-gray-700">Description:</span>
              <p className="mt-1 text-gray-600 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}
          {event.participants && (
            <div>
              <span className="font-medium text-gray-700">Participants (admin only):</span>
              <p className="mt-1 text-gray-600 whitespace-pre-wrap">{event.participants}</p>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
          <button type="button" onClick={() => downloadICS(event)} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-teal-blue hover:bg-teal-blue/10 rounded">
            <CalendarPlus size={16} />
            Add to calendar
          </button>
          <button type="button" onClick={onEdit} className="px-3 py-1.5 text-sm font-medium text-teal-blue hover:bg-teal-blue/10 rounded">
            Edit
          </button>
          <button type="button" onClick={onDelete} className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded">
            Remove
          </button>
        </div>
      </div>
  );
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function DashboardCalendarClient({
  initialEvents,
  schools,
  facilitators: initialFacilitators,
}: {
  initialEvents: EventRow[];
  schools: SchoolRow[];
  facilitators: FacilitatorRow[];
}) {
  const [events, setEvents] = useState(initialEvents);
  const [facilitators, setFacilitators] = useState(initialFacilitators);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventRow | null>(null);
  const [activeDay, setActiveDay] = useState(todayStr);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [participants, setParticipants] = useState("");
  const [scope, setScope] = useState<"general" | "schools">("general");
  const [schoolIds, setSchoolIds] = useState<string[]>([]);
  const [facilitatorIds, setFacilitatorIds] = useState<string[]>([]);
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [addSchoolId, setAddSchoolId] = useState("");
  const [showAddFacilitator, setShowAddFacilitator] = useState(false);
  const [addFacilitatorId, setAddFacilitatorId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const editingEvent = editingEventId ? events.find((e) => e.id === editingEventId) : null;
  const eventsForActiveDay = events.filter((e) => e.event_date === activeDay);

  function resetForm() {
    setEditingEventId(null);
    setTitle("");
    setDescription("");
    setEventDate("");
    setEventEndDate("");
    setEventTime("");
    setEventEndTime("");
    setParticipants("");
    setScope("general");
    setSchoolIds([]);
    setFacilitatorIds([]);
    setError("");
  }

  function loadEventIntoForm(ev: EventRow) {
    setEditingEventId(ev.id);
    setTitle(ev.title);
    setDescription(ev.description || "");
    setEventDate(ev.event_date);
    setEventEndDate(ev.event_end_date || "");
    setEventTime(ev.event_time ? ev.event_time.slice(0, 5) : "");
    setEventEndTime(ev.event_end_time ? ev.event_end_time.slice(0, 5) : "");
    setParticipants(ev.participants || "");
    setScope((ev.scope as "general" | "schools") || "general");
    setSchoolIds(ev.school_ids || []);
    setFacilitatorIds(ev.facilitator_ids || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim() || !eventDate) {
      setError("Title and date required.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        event_date: eventDate,
        event_end_date: eventEndDate || null,
        event_time: eventTime || null,
        event_end_time: eventEndTime || null,
        participants: participants.trim() || null,
        scope,
        school_ids: scope === "schools" ? schoolIds : [],
        facilitator_ids: facilitatorIds.slice(0, 4),
      };
      if (editingEventId) {
        const res = await fetch(`/api/admin/calendar/${editingEventId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || "Failed to update event.");
          return;
        }
        setEvents((prev) =>
          prev
            .map((ev) =>
              ev.id === editingEventId
                ? {
                    ...ev,
                    title: payload.title as string,
                    description: payload.description,
                    event_date: payload.event_date as string,
                    event_end_date: payload.event_end_date,
                    event_time: payload.event_time,
                    event_end_time: payload.event_end_time,
                    participants: payload.participants,
                    scope: payload.scope as string,
                    school_ids: scope === "schools" ? schoolIds : [],
                    facilitator_ids: facilitatorIds.slice(0, 4),
                  }
                : ev
            )
            .sort((a, b) => a.event_date.localeCompare(b.event_date))
        );
        resetForm();
      } else {
        const res = await fetch("/api/admin/calendar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || "Failed to add event.");
          return;
        }
        setEvents((prev) =>
          [...prev, { id: data.id, ...payload, created_at: new Date().toISOString(), school_ids: scope === "schools" ? schoolIds : [], facilitator_ids: facilitatorIds.slice(0, 4) }].sort(
            (a, b) => a.event_date.localeCompare(b.event_date)
          )
        );
        setTitle("");
        setDescription("");
        setEventDate("");
        setEventEndDate("");
        setEventTime("");
        setEventEndTime("");
        setParticipants("");
        setSchoolIds([]);
        setFacilitatorIds([]);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setSelectedEvent(null);
    try {
      const res = await fetch(`/api/admin/calendar/${id}`, { method: "DELETE" });
      if (res.ok) setEvents((prev) => prev.filter((e) => e.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  function addSchool(id: string) {
    if (!id || schoolIds.includes(id)) return;
    setSchoolIds((prev) => [...prev, id]);
    setAddSchoolId("");
    setShowAddSchool(false);
  }

  function removeSchool(id: string) {
    setSchoolIds((prev) => prev.filter((x) => x !== id));
  }

  function addFacilitator(id: string) {
    if (!id || facilitatorIds.includes(id) || facilitatorIds.length >= 4) return;
    setFacilitatorIds((prev) => [...prev, id]);
    setAddFacilitatorId("");
    setShowAddFacilitator(false);
  }

  function removeFacilitator(id: string) {
    setFacilitatorIds((prev) => prev.filter((x) => x !== id));
  }

  function onDayClick(dateStr: string, dayEvents: EventRow[]) {
    setActiveDay(dateStr);
    setSelectedEvent(null);
  }

  function onEventClick(ev: EventRow) {
    setActiveDay(ev.event_date);
    setSelectedEvent(ev);
  }

  const availableSchools = schools.filter((s) => !schoolIds.includes(s.id));
  const availableFacilitators = facilitators.filter((f) => !facilitatorIds.includes(f.id));

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4 max-w-xl">
        <h3 className="font-medium text-teal-blue">{editingEvent ? "Edit event" : "Add event"}</h3>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {editingEvent && (
          <button type="button" onClick={resetForm} className="text-sm text-gray-500 hover:underline">
            Cancel edit
          </button>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={2} />
        </div>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start date *</label>
            <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End date</label>
            <input type="date" value={eventEndDate} onChange={(e) => setEventEndDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
            <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End time</label>
            <input type="time" value={eventEndTime} onChange={(e) => setEventEndTime(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Participants (admin only)</label>
          <textarea value={participants} onChange={(e) => setParticipants(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={2} placeholder="Names or notes" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scope</label>
          <select value={scope} onChange={(e) => setScope(e.target.value as "general" | "schools")} className="w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="general">General (all schools)</option>
            <option value="schools">Specific schools</option>
          </select>
        </div>
        {scope === "schools" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Schools</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {schoolIds.map((id) => {
                const s = schools.find((x) => x.id === id);
                return (
                  <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-teal-blue/10 text-teal-blue rounded text-sm">
                    {s?.name ?? id}
                    <button type="button" onClick={() => removeSchool(id)} className="hover:bg-teal-blue/20 rounded p-0.5" aria-label="Remove school">
                      <X size={14} />
                    </button>
                  </span>
                );
              })}
            </div>
            {!showAddSchool ? (
              <button type="button" onClick={() => setShowAddSchool(true)} className="inline-flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-teal-blue hover:bg-teal-blue/10 rounded">
                <Plus size={16} />
                Add school
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={addSchoolId}
                  onChange={(e) => setAddSchoolId(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">— Select school —</option>
                  {availableSchools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => addSchool(addSchoolId)} disabled={!addSchoolId} className="px-3 py-1.5 text-sm font-medium bg-teal-blue text-white rounded disabled:opacity-50">
                  Add
                </button>
                <button type="button" onClick={() => { setShowAddSchool(false); setAddSchoolId(""); }} className="text-sm text-gray-600 hover:underline">
                  Cancel
                </button>
              </div>
            )}
            {availableSchools.length === 0 && schoolIds.length > 0 && <p className="text-xs text-gray-500 mt-1">All schools added.</p>}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Facilitators (up to 4)</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {facilitatorIds.map((id) => {
              const f = facilitators.find((x) => x.id === id);
              return (
                <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-teal-blue/10 text-teal-blue rounded text-sm">
                  {f?.name ?? id}
                  <button type="button" onClick={() => removeFacilitator(id)} className="hover:bg-teal-blue/20 rounded p-0.5" aria-label="Remove facilitator">
                    <X size={14} />
                  </button>
                </span>
              );
            })}
          </div>
          {facilitatorIds.length < 4 && (
            !showAddFacilitator ? (
              <button type="button" onClick={() => setShowAddFacilitator(true)} className="inline-flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-teal-blue hover:bg-teal-blue/10 rounded">
                <Plus size={16} />
                Add facilitator
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={addFacilitatorId}
                  onChange={(e) => setAddFacilitatorId(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">— Select facilitator —</option>
                  {availableFacilitators.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => addFacilitator(addFacilitatorId)} disabled={!addFacilitatorId} className="px-3 py-1.5 text-sm font-medium bg-teal-blue text-white rounded disabled:opacity-50">
                  Add
                </button>
                <button type="button" onClick={() => { setShowAddFacilitator(false); setAddFacilitatorId(""); }} className="text-sm text-gray-600 hover:underline">
                  Cancel
                </button>
              </div>
            )
          )}
          {availableFacilitators.length === 0 && facilitatorIds.length > 0 && facilitatorIds.length < 4 && <p className="text-xs text-gray-500 mt-1">All facilitators added or add more in Facilitators list.</p>}
        </div>
        <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg font-medium bg-lime-green text-white hover:opacity-90 disabled:opacity-60">
          {submitting ? (editingEvent ? "Updating…" : "Adding…") : editingEvent ? "Update event" : "Add event"}
        </button>
      </form>

      <div className="bg-white border border-gray-200 rounded-lg p-4 overflow-x-auto">
        <h3 className="font-medium text-teal-blue mb-3">Calendar view</h3>
        <MonthCalendar
          events={events}
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
          onDayClick={onDayClick}
          onEventClick={onEventClick}
          schools={schools}
          facilitators={facilitators}
        />
      </div>

      <div>
        <h3 className="font-medium text-teal-blue mb-3">
          Events for {new Date(activeDay + "T12:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
        </h3>
        {selectedEvent ? (
          <EventDetailBlock
            event={selectedEvent}
            schools={schools}
            facilitators={facilitators}
            onEdit={() => { loadEventIntoForm(selectedEvent); setSelectedEvent(null); }}
            onDelete={() => handleDelete(selectedEvent.id)}
            onBack={() => setSelectedEvent(null)}
          />
        ) : eventsForActiveDay.length === 0 ? (
          <p className="text-gray-500">No events on this day. Click a day in the calendar to change the date.</p>
        ) : (
          <ul className="space-y-2">
            {eventsForActiveDay.map((ev) => {
              const schoolNames = (ev.school_ids || []).map((id) => schools.find((s) => s.id === id)?.name).filter(Boolean) as string[];
              const facNames = (ev.facilitator_ids || []).map((id) => facilitators.find((f) => f.id === id)?.name).filter(Boolean) as string[];
              return (
                <li key={ev.id} className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-lg p-3">
                  <button
                    type="button"
                    onClick={() => onEventClick(ev)}
                    className="flex-1 text-left hover:bg-gray-50 rounded -m-3 p-3"
                  >
                    <span className="font-medium">{ev.title}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {ev.event_time && `${ev.event_time.slice(0, 5)} · `}
                      {schoolNames.length ? schoolNames.join(", ") + " / " : ""}
                      {facNames.length ? facNames.join(", ") : ""}
                    </span>
                  </button>
                  <div className="flex items-center gap-2 shrink-0">
                    <button type="button" onClick={() => { loadEventIntoForm(ev); setSelectedEvent(null); }} className="text-sm text-teal-blue hover:underline">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(ev.id)} disabled={deletingId === ev.id} className="text-sm text-red-600 hover:underline disabled:opacity-60">
                      {deletingId === ev.id ? "Removing…" : "Remove"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
