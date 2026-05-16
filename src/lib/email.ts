import { ALLOWED_EMAIL_DOMAINS } from "@/lib/constants";

/** Returns an error message, or null if the email is allowed. */
export function validateSchoolEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return "Email is required";

  const atIndex = trimmed.lastIndexOf("@");
  if (atIndex <= 0 || atIndex === trimmed.length - 1) {
    return "Enter a valid email address";
  }

  const domain = trimmed.slice(atIndex + 1);
  if (!ALLOWED_EMAIL_DOMAINS.includes(domain)) {
    return `Use an allowed email domain (${ALLOWED_EMAIL_DOMAINS.join(", ")})`;
  }

  return null;
}
