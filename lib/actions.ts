"use server";

import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { slugify } from "@/lib/utils";
import { getAppUrl } from "@/lib/app-url";

export type RegisterState = {
  error?: string;
  success?: boolean;
};

export async function registerUser(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) === "seller" ? Role.SELLER : Role.BUYER;

  if (!name || !email || !password) {
    return { error: "Tous les champs sont requis." };
  }

  if (password.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Cet email est déjà utilisé." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const verifyToken = randomBytes(32).toString("hex");

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      verifyToken,
      ...(role === Role.SELLER
        ? {
            sellerProfile: {
              create: {
                companyName: name,
              },
            },
          }
        : {}),
    },
  });

  await sendVerificationEmail(email, name, verifyToken);

  return { success: true };
}

export async function verifyEmail(token: string) {
  const user = await prisma.user.findUnique({ where: { verifyToken: token } });
  if (!user) return { error: "Token invalide ou expiré." };

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date(), verifyToken: null },
  });

  return { success: true };
}

export async function submitTemplateForReview(templateId: string, sellerId: string) {
  const template = await prisma.template.findFirst({
    where: { id: templateId, sellerId },
  });
  if (!template) throw new Error("Template introuvable");

  await prisma.template.update({
    where: { id: templateId },
    data: { status: "PENDING_REVIEW" },
  });
}

export async function createTemplateDraft(data: {
  title: string;
  description: string;
  longDescription?: string;
  price: number;
  categoryId: string;
  sellerId: string;
  techStack?: string;
  demoUrl?: string;
}) {
  const baseSlug = slugify(data.title);
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.template.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  return prisma.template.create({
    data: {
      title: data.title,
      slug,
      description: data.description,
      longDescription: data.longDescription,
      price: data.price,
      categoryId: data.categoryId,
      sellerId: data.sellerId,
      techStack: data.techStack,
      demoUrl: data.demoUrl,
      status: "DRAFT",
    },
  });
}

export async function approveTemplate(templateId: string) {
  const template = await prisma.template.update({
    where: { id: templateId },
    data: { status: "PUBLISHED", rejectionReason: null },
    include: { seller: { include: { user: true } } },
  });

  const { sendTemplateApprovedEmail } = await import("@/lib/email");
  await sendTemplateApprovedEmail(template.seller.user.email, template.title);
  return template;
}

export async function rejectTemplate(templateId: string, reason: string) {
  const template = await prisma.template.update({
    where: { id: templateId },
    data: { status: "REJECTED", rejectionReason: reason },
    include: { seller: { include: { user: true } } },
  });

  const { sendTemplateRejectedEmail } = await import("@/lib/email");
  await sendTemplateRejectedEmail(template.seller.user.email, template.title, reason);
  return template;
}

export async function initiateCheckout(templateId: string, userId: string) {
  const template = await prisma.template.findUnique({
    where: { id: templateId, status: "PUBLISHED" },
    include: { seller: true, files: true },
  });

  if (!template) throw new Error("Template introuvable");

  const existing = await prisma.purchase.findUnique({
    where: { buyerId_templateId: { buyerId: userId, templateId } },
  });
  if (existing) throw new Error("Vous avez déjà acheté ce template");

  const amount = template.discountPrice
    ? Number(template.discountPrice)
    : Number(template.price);

  const transactionId = `TH-${Date.now()}-${randomBytes(4).toString("hex")}`;

  const payment = await prisma.payment.create({
    data: {
      userId,
      amount,
      currency: process.env.PAYSTACK_CURRENCY ?? "NGN",
      provider: "paystack",
      providerId: transactionId,
      status: "PENDING",
      metadata: {
        templateId: template.id,
        sellerId: template.sellerId,
      },
    },
  });

  const { initPaystackPayment } = await import("@/lib/paystack");
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const appUrl = getAppUrl();

  const { authorizationUrl } = await initPaystackPayment({
    reference: transactionId,
    amountUsd: amount,
    email: user.email,
    metadata: { paymentId: payment.id, templateId: template.id },
    callbackUrl: `${appUrl}/checkout/success?reference=${transactionId}`,
  });

  return { paymentUrl: authorizationUrl, paymentId: payment.id };
}
