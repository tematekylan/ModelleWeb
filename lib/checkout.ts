import { prisma } from "@/lib/prisma";
import { calculateCommission } from "@/lib/commission";
import { sendPurchaseConfirmation, sendNewSaleEmail } from "@/lib/email";
import { verifyPaystackTransaction } from "@/lib/paystack";

export async function completePaymentByReference(reference: string, skipVerify = false) {
  const payment = await prisma.payment.findUnique({
    where: { providerId: reference },
  });

  if (!payment) {
    throw new Error("Paiement introuvable");
  }

  if (payment.status === "COMPLETED") {
    return { alreadyCompleted: true };
  }

  if (!skipVerify && process.env.PAYSTACK_SECRET_KEY) {
    const verification = await verifyPaystackTransaction(reference);
    const isSuccess =
      verification.status === true && verification.data?.status === "success";

    if (!isSuccess) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
      throw new Error("Paiement non confirmé par Paystack");
    }
  }

  const metadata = payment.metadata as { templateId: string; sellerId: string };
  const template = await prisma.template.findUniqueOrThrow({
    where: { id: metadata.templateId },
    include: { files: true, seller: { include: { user: true } } },
  });

  const buyer = await prisma.user.findUniqueOrThrow({ where: { id: payment.userId } });
  const amount = Number(payment.amount);
  const { commission, netAmount } = calculateCommission(amount);
  const downloadUrl = template.files[0]?.fileUrl ?? "";

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "COMPLETED" },
    });

    const existing = await tx.purchase.findUnique({
      where: {
        buyerId_templateId: { buyerId: payment.userId, templateId: template.id },
      },
    });

    if (existing) return;

    await tx.purchase.create({
      data: {
        templateId: template.id,
        buyerId: payment.userId,
        sellerId: metadata.sellerId,
        amount,
        commission,
        netAmount,
        paymentId: payment.id,
        downloadUrl,
      },
    });

    await tx.template.update({
      where: { id: template.id },
      data: { downloads: { increment: 1 } },
    });

    await tx.sellerProfile.update({
      where: { id: metadata.sellerId },
      data: {
        totalSales: { increment: 1 },
        totalEarnings: { increment: netAmount },
      },
    });
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const purchase = await prisma.purchase.findFirst({
    where: { paymentId: payment.id },
  });

  if (purchase) {
    await sendPurchaseConfirmation(
      buyer.email,
      buyer.name,
      template.title,
      `${appUrl}/api/download/${purchase.id}`
    );
    await sendNewSaleEmail(template.seller.user.email, template.title, amount);
  }

  return { success: true };
}

/** @deprecated use completePaymentByReference */
export async function completeDevPayment(reference: string) {
  return completePaymentByReference(reference, true);
}
