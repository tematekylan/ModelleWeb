"use client";

import { useState } from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TemplatePreviewProps {
  demoUrl?: string | null;
  title: string;
}

type Viewport = "desktop" | "tablet" | "mobile";

const viewportWidths: Record<Viewport, string> = {
  desktop: "w-full",
  tablet: "w-[768px] max-w-full",
  mobile: "w-[375px] max-w-full",
};

export function TemplatePreview({ demoUrl, title }: TemplatePreviewProps) {
  const [viewport, setViewport] = useState<Viewport>("desktop");

  if (!demoUrl) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-xl border bg-muted text-muted-foreground">
        Aperçu live non disponible
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2">
        <Button
          variant={viewport === "desktop" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewport("desktop")}
        >
          <Monitor className="h-4 w-4 mr-1" /> Desktop
        </Button>
        <Button
          variant={viewport === "tablet" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewport("tablet")}
        >
          <Tablet className="h-4 w-4 mr-1" /> Tablet
        </Button>
        <Button
          variant={viewport === "mobile" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewport("mobile")}
        >
          <Smartphone className="h-4 w-4 mr-1" /> Mobile
        </Button>
      </div>
      <div className="flex justify-center overflow-hidden rounded-xl border bg-muted p-4">
        <div className={cn("transition-all duration-300", viewportWidths[viewport])}>
          <iframe
            src={demoUrl}
            title={`Preview ${title}`}
            className="aspect-video w-full rounded-lg border bg-white"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}
