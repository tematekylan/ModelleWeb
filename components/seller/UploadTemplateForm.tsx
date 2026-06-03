"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Category = { id: string; name: string };

interface UploadTemplateFormProps {
  categories: Category[];
}

export function UploadTemplateForm({ categories }: UploadTemplateFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    longDescription: "",
    price: "",
    categoryId: "",
    techStack: "",
    demoUrl: "",
  });

  async function createDraft() {
    setLoading(true);
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price),
      }),
    });
    setLoading(false);

    if (!res.ok) {
      toast.error("Erreur lors de la création");
      return;
    }

    const data = await res.json();
    setTemplateId(data.id);
    setStep(2);
  }

  async function uploadFiles(type: "image" | "zip", files: FileList | null) {
    if (!templateId || !files?.length) return;
    setLoading(true);

    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append("file", file);
      body.append("templateId", templateId);
      body.append("type", type);

      const res = await fetch("/api/upload", { method: "POST", body });
      if (!res.ok) {
        toast.error(`Échec upload: ${file.name}`);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    toast.success("Fichiers uploadés");
    if (type === "zip") setStep(3);
  }

  async function submitForReview() {
    if (!templateId) return;
    setLoading(true);
    const res = await fetch(`/api/templates/${templateId}/submit`, { method: "POST" });
    setLoading(false);

    if (!res.ok) {
      toast.error("Erreur lors de la soumission");
      return;
    }

    toast.success("Template soumis pour review!");
    router.push("/seller/templates");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload template — Étape {step}/3</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 1 && (
          <>
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description courte</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description longue</Label>
              <Textarea
                value={form.longDescription}
                onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Prix (USD)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => setForm({ ...form, categoryId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tech stack</Label>
                <Input
                  value={form.techStack}
                  onChange={(e) => setForm({ ...form, techStack: e.target.value })}
                  placeholder="Next.js, Tailwind..."
                />
              </div>
              <div className="space-y-2">
                <Label>URL démo</Label>
                <Input
                  value={form.demoUrl}
                  onChange={(e) => setForm({ ...form, demoUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <Button onClick={createDraft} disabled={loading} className="w-full">
              Continuer
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-2">
              <Label>Images preview (PNG/JPG)</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => uploadFiles("image", e.target.files)}
              />
            </div>
            <div className="space-y-2">
              <Label>Fichier ZIP du template</Label>
              <Input
                type="file"
                accept=".zip"
                onChange={(e) => uploadFiles("zip", e.target.files)}
              />
            </div>
            <Button variant="outline" onClick={() => setStep(3)} disabled={loading}>
              Passer à la confirmation
            </Button>
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-muted-foreground">
              Votre template sera examiné par notre équipe avant publication.
            </p>
            <Button onClick={submitForReview} disabled={loading} className="w-full">
              Soumettre pour review
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
