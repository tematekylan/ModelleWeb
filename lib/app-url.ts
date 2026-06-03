/**
 * URL publique de l'app — emails, callbacks Paystack, etc.
 * Sur Vercel, VERCEL_URL est défini automatiquement si NEXT_PUBLIC_APP_URL manque.
 */
export function getAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.AUTH_URL) {
    return process.env.AUTH_URL.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}
