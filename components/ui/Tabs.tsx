"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  value: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export function Tabs({ tabs, defaultValue, onChange }: TabsProps) {
  const [active, setActive] = useState(defaultValue ?? tabs[0]?.value);
  const baseId = useId();

  function selectTab(value: string) {
    setActive(value);
    onChange?.(value);
  }

  return (
    <div>
      <div role="tablist" className="flex gap-1 border-b border-border">
        {tabs.map((tab) => {
          const isActive = active === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.value}`}
              aria-selected={isActive}
              aria-controls={`${baseId}-panel-${tab.value}`}
              onClick={() => selectTab(tab.value)}
              className={cn(
                "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-foreground/60 hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => {
        const isActive = active === tab.value;
        return (
          <div
            key={tab.value}
            role="tabpanel"
            id={`${baseId}-panel-${tab.value}`}
            aria-labelledby={`${baseId}-tab-${tab.value}`}
            hidden={!isActive}
            className="pt-4"
          >
            {tab.content}
          </div>
        );
      })}
    </div>
  );
}
