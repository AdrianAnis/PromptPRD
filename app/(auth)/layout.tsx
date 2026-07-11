export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]"
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-headline-sm font-semibold text-primary">
            P
          </span>
          <div>
            <p className="text-headline-sm font-semibold">PromptPRD</p>
            <p className="text-body-sm text-foreground/60">
              Turn a product idea into a PRD and backlog with AI.
            </p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
