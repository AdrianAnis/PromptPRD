"use client";

import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="sticky top-0 z-50 bg-warning px-4 py-2 text-center text-body-sm font-medium text-warning-foreground"
    >
      Koneksi internet terputus. Perubahan akan tersimpan otomatis saat koneksi kembali.
    </div>
  );
}
