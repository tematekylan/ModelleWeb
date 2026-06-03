import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { submitTemplateForReview } from "@/lib/actions";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!seller) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const template = await prisma.template.findFirst({
    where: { id, sellerId: seller.id },
    include: { files: true, images: true },
  });

  if (!template) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!template.files.length) {
    return NextResponse.json({ error: "ZIP file required" }, { status: 400 });
  }

  await submitTemplateForReview(id, seller.id);
  return NextResponse.json({ success: true });
}
