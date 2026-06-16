/**
 * Normalize school name for deduplication: trim, lowercase, collapse spaces.
 */
export function normalizeSchoolName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Sanitize display name: trim and limit length. */
export function sanitizeSchoolDisplayName(name: string, maxLength = 200): string {
  return name.trim().slice(0, maxLength);
}
