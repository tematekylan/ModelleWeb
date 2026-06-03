import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCategories } from "@/lib/templates";
import { UploadTemplateForm } from "@/components/seller/UploadTemplateForm";

export default async function SellerUploadPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "SELLER" && session.user.role !== "ADMIN") redirect("/dashboard");

  const categories = await getCategories();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Upload un template</h1>
      <UploadTemplateForm categories={categories} />
    </div>
  );
}
