import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">PromptPRD</h1>
      <p className="max-w-lg text-foreground/60">
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
    </div>
  );
}
