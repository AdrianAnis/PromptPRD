import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;
type GetClaimsOptions = NonNullable<Parameters<SupabaseClient["auth"]["getClaims"]>[1]>;
type Jwks = NonNullable<GetClaimsOptions["jwks"]>;

let jwksCache: Jwks | null = null;

async function getJwks(): Promise<Jwks | undefined> {
  if (jwksCache) return jwksCache;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/.well-known/jwks.json`
    );
    if (!res.ok) return undefined;
    jwksCache = (await res.json()) as Jwks;
    return jwksCache;
  } catch {
    return undefined;
  }
}

export const getAuthClaims = cache(async () => {
  const supabase = await createClient();
  const jwks = await getJwks();
  const { data } = await supabase.auth.getClaims(undefined, jwks ? { jwks } : undefined);
  return data?.claims ?? null;
});

export const getOwnProfile = cache(async () => {
  const claims = await getAuthClaims();
  if (!claims?.sub) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", claims.sub)
    .single();

  return data;
});
