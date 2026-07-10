"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
      className={cn(
        "m-auto rounded-xl border border-border bg-background p-0 shadow-lg backdrop:bg-black/40",
        "w-full max-w-md",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        {title && <h2 className="text-base font-semibold">{title}</h2>}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="ml-auto rounded-md p-1 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          ✕
        </button>
      </div>
      {/* Unmount contents while closed so per-open state (e.g. useActionState
          form errors) resets instead of persisting stale across reopens. */}
      <div className="p-5">{open && children}</div>
    </dialog>
  );
}
