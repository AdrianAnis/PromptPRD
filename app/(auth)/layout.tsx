export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <p className="text-4xl font-semibold tracking-tight sm:text-5xl">PromptPRD</p>
          <p className="mt-2 text-body-sm text-foreground/60">
            Turn a product idea into a PRD and backlog with AI.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
