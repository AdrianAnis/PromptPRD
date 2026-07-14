"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useOneShotSearchParam(key: string, onMatch: (value: string) => void) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const handled = useRef(false);
  const onMatchRef = useRef(onMatch);
  const value = searchParams.get(key);

  useEffect(() => {
    onMatchRef.current = onMatch;
  }, [onMatch]);

  useEffect(() => {
    if (!value || handled.current) return;
    handled.current = true;
    onMatchRef.current(value);

    const remaining = new URLSearchParams(searchParams);
    remaining.delete(key);
    const query = remaining.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
}
