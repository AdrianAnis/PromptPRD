import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const FEATURES = [
  {
    title: "AI Requirement Interview",
    description:
      "AI menanyakan hal-hal yang belum jelas dari idemu — target pengguna, platform, fitur pembayaran — sebelum menulis satu baris dokumen.",
    icon: (
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
    ),
  },
  {
    title: "AI Product Structuring",
    description:
      "Hasil wawancara disusun jadi feature tree yang bisa kamu edit — tambah, hapus, atau minta AI menyusun ulang.",
    icon: (
      <>
        <circle cx="6" cy="6" r="2.5" />
        <circle cx="6" cy="18" r="2.5" />
        <circle cx="18" cy="12" r="2.5" />
        <path d="M8 6h5a3 3 0 0 1 3 3M8 18h5a3 3 0 0 0 3-3" />
      </>
    ),
  },
  {
    title: "AI PRD Generation",
    description:
      "Overview, goals, user stories, functional & non-functional requirements — dihasilkan lengkap dan siap diedit langsung.",
    icon: (
      <>
        <path d="M8 3h5l5 5v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
        <path d="M13 3v5h5M9 13h6M9 17h6" />
      </>
    ),
  },
  {
    title: "AI Task Breakdown",
    description:
      "PRD otomatis dipecah jadi Epic, User Story, dan Task — backlog yang siap dipakai tim development tanpa kerja ulang.",
    icon: <path d="m9 11 3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />,
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="flex flex-col items-center gap-6 px-4 pb-16 pt-24 text-center sm:pt-32">
        <span className="rounded-full border border-border bg-surface px-3 py-1 text-label-md text-foreground/60">
          AI sebagai Product Manager virtual
        </span>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">PromptPRD</h1>
        <p className="max-w-lg text-body-lg text-foreground/60">
          Turn a product idea into a structured PRD, feature breakdown, and
          development backlog — guided by AI acting as your Product Manager.
        </p>
        <div className="flex gap-3">
          <Link href="/register">
            <Button size="lg">Get started</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Log in
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 px-4 pb-24 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <Card key={feature.title} className="flex flex-col gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
              >
                {feature.icon}
              </svg>
            </span>
            <h2 className="text-headline-sm font-semibold">{feature.title}</h2>
            <p className="text-body-sm text-foreground/60">{feature.description}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
