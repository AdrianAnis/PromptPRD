"use client";

import { memo, useEffect, useState, useSyncExternalStore } from "react";
import { getCurrentTheme, getServerTheme, subscribeTheme } from "@/lib/theme";
import { newId } from "@/lib/utils";

interface MermaidDiagramProps {
  code: string;
  onRendered?: (svg: string) => void;
}

type MermaidTheme = "default" | "dark";

let renderQueue: Promise<unknown> = Promise.resolve();

function renderMermaid(code: string, theme: MermaidTheme): Promise<string> {
  const run = renderQueue.then(async () => {
    const mermaid = (await import("mermaid")).default;
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      htmlLabels: false,
      theme,
      flowchart: { htmlLabels: false },
      class: { htmlLabels: false },
    });
    const renderId = `mermaid-${newId()}`;
    try {
      const { svg } = await mermaid.render(renderId, code);
      return svg;
    } finally {
      document.getElementById(renderId)?.remove();
      document.getElementById(`d${renderId}`)?.remove();
    }
  });
  renderQueue = run.catch(() => undefined);
  return run;
}

function MermaidDiagramImpl({ code, onRendered }: MermaidDiagramProps) {
  const theme = useSyncExternalStore(subscribeTheme, getCurrentTheme, getServerTheme);
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);

  const hasCode = code.trim().length > 0;

  useEffect(() => {
    if (!hasCode) return;
    let cancelled = false;

    renderMermaid(code, theme === "light" ? "default" : "dark")
      .then((rendered) => {
        if (cancelled) return;
        setSvg(rendered);
        setError(null);
        onRendered?.(rendered);
      })
      .catch((err) => {
        if (cancelled) return;
        setSvg("");
        setError(err instanceof Error ? err.message.split("\n")[0] : "Sintaks diagram tidak valid.");
      });

    return () => {
      cancelled = true;
    };
  }, [code, hasCode, theme, onRendered]);

  if (!hasCode) {
    return <p className="text-body-sm text-foreground/50">Belum ada diagram.</p>;
  }

  if (error) {
    return (
      <div className="rounded border border-error/30 bg-error/10 px-3 py-2 text-body-sm text-error">
        Diagram tidak bisa dirender: {error}
      </div>
    );
  }

  if (!svg) {
    return <p className="text-body-sm text-foreground/50">Belum ada diagram.</p>;
  }

  return <div className="overflow-x-auto" dangerouslySetInnerHTML={{ __html: svg }} />;
}

export const MermaidDiagram = memo(MermaidDiagramImpl);
