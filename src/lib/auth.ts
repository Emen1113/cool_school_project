import { ALLOWED_EMAIL_DOMAINS } from "@/lib/constants";

export function isAllowedSchoolEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return ALLOWED_EMAIL_DOMAINS.some(
    (allowed) => domain === allowed || domain.endsWith(`.${allowed}`)
  );
}

export function validateSchoolEmail(email: string): string | null {
  if (!email.includes("@")) return "Enter a valid email address";
  if (!isAllowedSchoolEmail(email)) {
    return `Only school emails are allowed (${ALLOWED_EMAIL_DOMAINS.join(", ")})`;
  }
  return null;
}
