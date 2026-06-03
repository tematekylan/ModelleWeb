import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage, uploadZip } from "@/lib/cloudinary";

const MAX_ZIP_SIZE = 50 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const templateId = formData.get("templateId") as string;
  const type = formData.get("type") as "image" | "zip";

  if (!file || !templateId || !type) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!seller) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const template = await prisma.template.findFirst({
    where: { id: templateId, sellerId: seller.id },
  });
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (type === "zip") {
    if (!file.name.endsWith(".zip")) {
      return NextResponse.json({ error: "Only ZIP files allowed" }, { status: 400 });
    }
    if (buffer.length > MAX_ZIP_SIZE) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      await prisma.templateFile.create({
        data: {
          templateId,
          fileType: "zip",
          fileUrl: `local://${file.name}`,
          fileName: file.name,
          size: buffer.length,
        },
      });
      return NextResponse.json({ success: true, dev: true });
    }

    const uploaded = await uploadZip(buffer, file.name);
    await prisma.templateFile.create({
      data: {
        templateId,
        fileType: "zip",
        fileUrl: uploaded.url,
        fileName: file.name,
        size: uploaded.size,
      },
    });
  } else {
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only images allowed" }, { status: 400 });
    }

    const existingImages = await prisma.templateImage.count({ where: { templateId } });

    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      await prisma.templateImage.create({
        data: {
          templateId,
          imageUrl: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80",
          isPrimary: existingImages === 0,
          order: existingImages,
          altText: file.name,
        },
      });
      return NextResponse.json({ success: true, dev: true });
    }

    const uploaded = await uploadImage(buffer);
    await prisma.templateImage.create({
      data: {
        templateId,
        imageUrl: uploaded.url,
        isPrimary: existingImages === 0,
        order: existingImages,
        altText: file.name,
      },
    });
  }

  return NextResponse.json({ success: true });
}
