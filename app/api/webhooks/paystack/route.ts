import { NextResponse } from "next/server";
import { verifyPaystackWebhookSignature } from "@/lib/paystack";
import { completePaymentByReference } from "@/lib/checkout";

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (process.env.PAYSTACK_SECRET_KEY && !verifyPaystackWebhookSignature(bodyText, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(bodyText) as {
      event: string;
      data: { reference: string; status: string };
    };

    if (body.event !== "charge.success" || body.data?.status !== "success") {
      return NextResponse.json({ message: "Event ignored" });
    }

    const reference = body.data.reference;
    await completePaymentByReference(reference);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
