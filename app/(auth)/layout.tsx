export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-headline-sm font-semibold tracking-tight">PromptPRD</p>
          <p className="mt-1 text-body-sm text-foreground/60">
            Turn a product idea into a PRD and backlog with AI.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
