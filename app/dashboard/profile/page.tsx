import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The dashboard layout already redirects unauthenticated visitors, but
  // this page fetches its own session independently — if it ever expires
  // in the gap between the two checks, fail safe instead of throwing.
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex max-w-md flex-col gap-6">
      <h1 className="text-xl font-semibold">Profile</h1>
      <ProfileForm email={user.email ?? ""} fullName={profile?.full_name ?? ""} />
    </div>
  );
}
