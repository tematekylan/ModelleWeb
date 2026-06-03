import crypto from "crypto";
import { getAppUrl } from "@/lib/app-url";

const PAYSTACK_BASE = "https://api.paystack.co";

export interface PaystackInitParams {
  reference: string;
  amountUsd: number;
  email: string;
  metadata?: Record<string, string>;
  callbackUrl?: string;
}

function toPaystackSubunit(amountUsd: number): { amount: number; currency: string } {
  const currency = process.env.PAYSTACK_CURRENCY ?? "NGN";

  if (currency === "USD") {
    return { amount: Math.round(amountUsd * 100), currency };
  }

  const rate = parseFloat(process.env.PAYSTACK_USD_TO_NGN ?? "1600");
  return { amount: Math.round(amountUsd * rate * 100), currency };
}

export async function initPaystackPayment(params: PaystackInitParams) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    if (process.env.NODE_ENV === "development") {
      const appUrl = getAppUrl();
      return {
        authorizationUrl: `${appUrl}/checkout/success?reference=${params.reference}&dev=1`,
      };
    }
    throw new Error("PAYSTACK_SECRET_KEY non configurée");
  }

  const { amount, currency } = toPaystackSubunit(params.amountUsd);
  const appUrl = getAppUrl();

  const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount,
      currency,
      reference: params.reference,
      callback_url: params.callbackUrl ?? `${appUrl}/checkout/success`,
      metadata: params.metadata,
    }),
  });

  const data = await response.json();

  if (!data.status) {
    throw new Error(data.message ?? "Échec initialisation Paystack");
  }

  return {
    authorizationUrl: data.data.authorization_url as string,
  };
}

export async function verifyPaystackTransaction(reference: string) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    return { status: true, data: { status: "success" } };
  }

  const response = await fetch(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });

  return response.json();
}

export function verifyPaystackWebhookSignature(body: string, signature: string | null) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;

  const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");
  return hash === signature;
}
