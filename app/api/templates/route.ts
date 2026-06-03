import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTemplateDraft } from "@/lib/actions";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "SELLER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!seller) {
    return NextResponse.json({ error: "Seller profile not found" }, { status: 400 });
  }

  const body = await request.json();

  const template = await createTemplateDraft({
    title: body.title,
    description: body.description,
    longDescription: body.longDescription,
    price: body.price,
    categoryId: body.categoryId,
    sellerId: seller.id,
    techStack: body.techStack,
    demoUrl: body.demoUrl,
  });

  return NextResponse.json({ id: template.id, slug: template.slug });
}
