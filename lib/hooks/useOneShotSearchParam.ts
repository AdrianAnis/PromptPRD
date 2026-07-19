"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useOneShotSearchParam(key: string, onMatch: (value: string) => void) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const handled = useRef(false);
  const onMatchRef = useRef(onMatch);
  const stripParamFromUrlRef = useRef<() => void>(() => {});
  const value = searchParams.get(key);

  useEffect(() => {
    onMatchRef.current = onMatch;
  }, [onMatch]);

  useEffect(() => {
    stripParamFromUrlRef.current = () => {
      const remaining = new URLSearchParams(searchParams);
      remaining.delete(key);
      const query = remaining.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    };
  }, [searchParams, key, router, pathname]);

  useEffect(() => {
    if (!value || handled.current) return;
    handled.current = true;
    onMatchRef.current(value);
    stripParamFromUrlRef.current();
  }, [value]);
}
