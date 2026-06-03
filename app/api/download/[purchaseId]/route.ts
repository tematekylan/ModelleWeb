import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ purchaseId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { purchaseId } = await params;

  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: { template: { include: { files: true } } },
  });

  if (!purchase || purchase.buyerId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const fileUrl = purchase.downloadUrl || purchase.template.files[0]?.fileUrl;

  if (!fileUrl) {
    return NextResponse.json({ error: "No download available" }, { status: 404 });
  }

  await prisma.purchase.update({
    where: { id: purchaseId },
    data: { downloadedAt: new Date() },
  });

  return NextResponse.redirect(fileUrl);
}
