import Link from "next/link";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Projects" },
  { href: "/dashboard/profile", label: "Profile" },
];

export function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col gap-1 border-r border-border bg-surface p-4">
      <Link href="/dashboard" className="mb-6 px-2 text-lg font-semibold">
        PromptPRD
      </Link>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-background"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
