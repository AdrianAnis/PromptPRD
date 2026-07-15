import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;
type GetClaimsOptions = NonNullable<Parameters<SupabaseClient["auth"]["getClaims"]>[1]>;
type Jwks = NonNullable<GetClaimsOptions["jwks"]>;

// Module-level JWKS cache, persisted for the life of the server process.
// getClaims() verifies the ES256 session JWT with the WebCrypto API, but it
// caches the signing keys on the *client instance* — and we create a fresh
// cookie-bound client per request, so without this the key set would be
// re-fetched over the network on every navigation, negating the whole point.
// Fetching it once here keeps getClaims fully local after the first call.
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
    // On failure, fall back to letting getClaims fetch the keys itself.
    return undefined;
  }
}

/**
 * Per-request cached auth claims. `getClaims()` verifies the session JWT
 * locally (this project signs with ES256 / asymmetric keys) — unlike
 * `getUser()`, which always calls the Supabase Auth server. proxy.ts keeps
 * using `getUser()` since it's the single authoritative refresh point;
 * everything downstream (layouts, pages) should use this to avoid stacking
 * redundant network round trips on every navigation.
 *
 * React `cache()` dedupes the call across the layout + page in one render.
 */
export const getAuthClaims = cache(async () => {
  const supabase = await createClient();
  const jwks = await getJwks();
  const { data } = await supabase.auth.getClaims(undefined, jwks ? { jwks } : undefined);
  return data?.claims ?? null;
});

/** Per-request cached profile row for the signed-in user. */
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
