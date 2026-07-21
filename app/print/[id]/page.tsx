import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthClaims } from "@/lib/supabase/auth";
import { Markdown } from "@/components/ui/Markdown";
import { PrintControls } from "@/components/print/PrintControls";

export default async function PrintPrdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const claims = await getAuthClaims();
  if (!claims) redirect("/login");

  const supabase = await createClient();
  const [{ data: project }, { data: prd }] = await Promise.all([
    supabase.from("projects").select("name").eq("id", id).maybeSingle(),
    supabase.from("prds").select("content_markdown").eq("project_id", id).maybeSingle(),
  ]);

  if (!project) notFound();

  const markdown = prd?.content_markdown?.trim() ?? "";

  return (
    <main className="mx-auto w-full max-w-3xl px-8 py-10 print:max-w-none print:px-0 print:py-0">
      <PrintControls auto={markdown.length > 0} />

      <header className="mb-8">
        <h1 className="text-headline-lg font-semibold tracking-tight">{project.name}</h1>
        <p className="text-body-sm text-foreground/60">Product Requirement Document</p>
      </header>

      {markdown ? (
        <Markdown source={markdown} />
      ) : (
        <p className="text-body-md text-foreground/60">PRD belum dibuat untuk project ini.</p>
      )}
    </main>
  );
}
