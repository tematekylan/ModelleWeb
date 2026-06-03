import { PrismaClient, Role, TemplateStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80";

async function main() {
  await prisma.purchase.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.templateFile.deleteMany();
  await prisma.templateImage.deleteMany();
  await prisma.template.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.sellerProfile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@templatehub.cm",
      name: "Admin TemplateHub",
      passwordHash,
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  });

  const sellers = await Promise.all(
    [
      { email: "seller1@templatehub.cm", name: "Studio Douala", company: "Douala Web Studio" },
      { email: "seller2@templatehub.cm", name: "Yaoundé Design", company: "YDE Creative" },
      { email: "seller3@templatehub.cm", name: "Afrique Digital", company: "Afrique Digital Agency" },
    ].map(async (s) => {
      const user = await prisma.user.create({
        data: {
          email: s.email,
          name: s.name,
          passwordHash,
          role: Role.SELLER,
          emailVerified: new Date(),
          sellerProfile: {
            create: {
              companyName: s.company,
              bio: "Créateur de templates modernes pour l'Afrique francophone.",
              verified: true,
            },
          },
        },
        include: { sellerProfile: true },
      });
      return user;
    })
  );

  const buyer = await prisma.user.create({
    data: {
      email: "buyer@templatehub.cm",
      name: "Acheteur Test",
      passwordHash,
      role: Role.BUYER,
      emailVerified: new Date(),
    },
  });

  const categories = await Promise.all(
    [
      { name: "Business", slug: "business", icon: "briefcase", order: 1 },
      { name: "Portfolio", slug: "portfolio", icon: "image", order: 2 },
      { name: "E-commerce", slug: "ecommerce", icon: "shopping-cart", order: 3 },
      { name: "Landing Page", slug: "landing-page", icon: "rocket", order: 4 },
      { name: "Blog", slug: "blog", icon: "newspaper", order: 5 },
      { name: "SaaS", slug: "saas", icon: "cloud", order: 6 },
      { name: "Restaurant", slug: "restaurant", icon: "utensils", order: 7 },
      { name: "Agence", slug: "agence", icon: "building", order: 8 },
    ].map((c) => prisma.category.create({ data: c }))
  );

  const tags = await Promise.all(
    ["React", "Next.js", "Tailwind", "Vue", "Dark Mode", "Responsive"].map((name, i) =>
      prisma.tag.create({
        data: {
          name,
          slug: name.toLowerCase().replace(/\./g, "").replace(/\s+/g, "-"),
          usageCount: 5 - i,
        },
      })
    )
  );

  const templateData = [
    { title: "Nova Business Pro", price: 49, featured: true, category: 0, seller: 0, tech: "Next.js" },
    { title: "Afrique Startup", price: 39, featured: true, category: 5, seller: 0, tech: "React" },
    { title: "Portfolio Creative", price: 29, featured: true, category: 1, seller: 1, tech: "Next.js" },
    { title: "Shop Local CM", price: 59, featured: true, category: 2, seller: 1, tech: "Next.js" },
    { title: "Landing SaaS Flow", price: 35, featured: false, category: 3, seller: 2, tech: "React" },
    { title: "Blog Magazine", price: 25, featured: false, category: 4, seller: 2, tech: "Next.js" },
    { title: "Restaurant Douala", price: 45, featured: false, category: 6, seller: 0, tech: "Vue" },
    { title: "Agence Premium", price: 55, featured: false, category: 7, seller: 1, tech: "Next.js" },
    { title: "Minimal Portfolio", price: 19, featured: false, category: 1, seller: 2, tech: "React" },
    { title: "E-shop Fashion", price: 65, featured: false, category: 2, seller: 0, tech: "Next.js" },
    { title: "SaaS Dashboard", price: 75, featured: true, category: 5, seller: 1, tech: "Next.js" },
    { title: "Corporate Elite", price: 49, featured: false, category: 0, seller: 2, tech: "React" },
    { title: "Food Delivery", price: 42, featured: false, category: 6, seller: 0, tech: "Next.js" },
    { title: "Dev Portfolio", price: 22, featured: false, category: 1, seller: 1, tech: "Next.js" },
    { title: "Launch Pro", price: 32, featured: false, category: 3, seller: 2, tech: "React" },
  ];

  for (const t of templateData) {
    const slug = t.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const sellerProfile = sellers[t.seller].sellerProfile!;

    await prisma.template.create({
      data: {
        title: t.title,
        slug,
        description: `Template ${t.title} — design moderne 2025, responsive et optimisé SEO.`,
        longDescription: `Un template professionnel ${t.tech} conçu pour le marché africain. Inclut pages multiples, dark mode, et documentation complète.`,
        price: t.price,
        discountPrice: t.price > 40 ? t.price * 0.85 : null,
        categoryId: categories[t.category].id,
        sellerId: sellerProfile.id,
        status: TemplateStatus.PUBLISHED,
        featured: t.featured,
        demoUrl: "https://vercel.com/templates",
        techStack: t.tech,
        downloads: Math.floor(Math.random() * 200),
        views: Math.floor(Math.random() * 1000),
        tags: {
          connect: tags.slice(0, 3).map((tag) => ({ id: tag.id })),
        },
        images: {
          create: [
            {
              imageUrl: PLACEHOLDER_IMAGE,
              isPrimary: true,
              order: 0,
              altText: t.title,
            },
          ],
        },
        files: {
          create: {
            fileType: "zip",
            fileUrl: "https://example.com/template.zip",
            fileName: `${slug}.zip`,
            size: 5242880,
          },
        },
      },
    });
  }

  console.log("Seed completed:");
  console.log(`  Admin: ${admin.email}`);
  console.log(`  Sellers: ${sellers.map((s) => s.email).join(", ")}`);
  console.log(`  Buyer: ${buyer.email}`);
  console.log("  Password for all: Password123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
