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
  const valueRef = useRef(value);
  const isSavingRef = useRef(false);
  const pendingValueRef = useRef<{ value: T } | null>(null);
  const lastResultRef = useRef<SaveResult>(undefined);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const runSave = useCallback(async (nextValue: T) => {
    if (isSavingRef.current) {
      pendingValueRef.current = { value: nextValue };
      return;
    }

    isSavingRef.current = true;
    let current = nextValue;
    for (;;) {
      const result = await onSaveRef.current(current);
      lastResultRef.current = result;
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

    const timeout = setTimeout(() => {
      if (!enabledRef.current) return;
      setStatus("saving");
      void runSave(value);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [value, runSave]);

  const flush = useCallback(async (): Promise<SaveResult> => {
    setStatus("saving");
    await runSave(valueRef.current);
    return lastResultRef.current;
  }, [runSave]);

  return { status, flush };
}
