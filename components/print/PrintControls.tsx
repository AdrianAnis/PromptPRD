"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

const PRINT_DELAY_MS = 400;

export function PrintControls({ auto }: { auto: boolean }) {
  useEffect(() => {
    if (!auto) return;
    const timer = setTimeout(() => window.print(), PRINT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [auto]);

  return (
    <div className="mb-6 flex justify-end print:hidden">
      <Button size="sm" onClick={() => window.print()}>
        Cetak / Simpan PDF
      </Button>
    </div>
  );
}
