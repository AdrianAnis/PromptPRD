"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEBOUNCE_MS = 1200;

type SaveStatus = "idle" | "saving" | "saved" | "error";
type SaveResult = { error?: string } | void;

export function useAutosave<T>(value: T, onSave: (value: T) => Promise<SaveResult>) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const isFirstRender = useRef(true);
  const onSaveRef = useRef(onSave);
  const isSavingRef = useRef(false);
  const pendingValueRef = useRef<{ value: T } | null>(null);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

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

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setStatus("saving");
    const timeout = setTimeout(() => {
      void runSave(value);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [value, runSave]);

  return status;
}
