import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountMenu } from "@/components/layout/AccountMenu";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between bg-background/80 px-6 backdrop-blur-sm">
        <Link href="/dashboard" className="text-headline-sm font-semibold">
          PromptPRD
        </Link>
        <AccountMenu email={user.email ?? ""} fullName={profile?.full_name ?? ""} />
      </header>
      <main className="flex flex-1 flex-col p-6">{children}</main>
    </div>
  );
}
