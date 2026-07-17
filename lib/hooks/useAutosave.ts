"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEBOUNCE_MS = 1200;

type SaveStatus = "idle" | "saving" | "saved" | "error";
type SaveResult = { error?: string } | void;

export function useAutosave<T>(
  value: T,
  onSave: (value: T) => Promise<SaveResult>,
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled ?? true;
  const [status, setStatus] = useState<SaveStatus>("idle");
  const isFirstRender = useRef(true);
  const onSaveRef = useRef(onSave);
  const enabledRef = useRef(enabled);
  const isSavingRef = useRef(false);
  const pendingValueRef = useRef<{ value: T } | null>(null);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const runSave = useCallback(async (nextValue: T) => {
    if (isSavingRef.current) {
      pendingValueRef.current = { value: nextValue };
      return;
    }

    isSavingRef.current = true;
    let current = nextValue;
    for (;;) {
      const result = await onSaveRef.current(current);
      setStatus(result?.error ? "error" : "saved");

      const pending = pendingValueRef.current;
      if (!pending) break;
      pendingValueRef.current = null;
      current = pending.value;
    }
    isSavingRef.current = false;
  }, []);

  // Only `value` changes schedule a save — deliberately NOT `enabled`, so
  // toggling enabled (e.g. an AI regenerate finishing) never re-triggers a
  // save of unchanged data. `enabled` is read live via the ref at fire time.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      if (!enabledRef.current) return;
      setStatus("saving");
      void runSave(value);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [value, runSave]);

  return status;
}
