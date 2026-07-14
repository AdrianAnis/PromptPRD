import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto w-full max-w-md">
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1.5 text-body-sm text-foreground/60 hover:text-foreground"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3.5"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Kembali ke Dashboard
      </Link>
      <ProfileForm email={user.email ?? ""} fullName={profile?.full_name ?? ""} />
    </div>
  );
}
