import { TemplateCard } from "./TemplateCard";
import type { Prisma } from "@prisma/client";

type TemplateWithRelations = Prisma.TemplateGetPayload<{
  include: {
    category: true;
    seller: { include: { user: { select: { name: true } } } };
    images: true;
    tags: true;
  };
}>;

interface TemplateGridProps {
  templates: TemplateWithRelations[];
}

export function TemplateGrid({ templates }: TemplateGridProps) {
  if (templates.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
        Aucun template trouvé.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
}
