"use client";

import { useOneShotSearchParam } from "@/lib/hooks/useOneShotSearchParam";
import { useToast } from "@/components/ui/Toast";

export function WelcomeToast() {
  const { showToast } = useToast();

  useOneShotSearchParam("welcome", () => {
    showToast("Registrasi berhasil! Selamat datang di PromptPRD.", "success");
  });

  return null;
}
