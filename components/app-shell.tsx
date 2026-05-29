"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/add-expense", label: "Add Expense" },
  { href: "/reports", label: "Reports" },
  { href: "/savings-goals", label: "Savings Goals" },
  { href: "/purchase-advisor", label: "Purchase Advisor" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA]">
      <button
        className="fixed left-4 top-4 z-50 rounded-md border border-[#222222] bg-[#111111] p-2 md:hidden"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle navigation"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open ? <button className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setOpen(false)} aria-label="Close navigation" /> : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-[#222222] bg-[#111111] p-6 transition-transform duration-300 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link href="/" className="mb-8 block text-lg font-semibold tracking-tight text-[#FAFAFA]">
          MoneyLens India
        </Link>
        <nav className="space-y-2">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-[#181818] text-[#FAFAFA]"
                    : "text-[#A1A1AA] hover:bg-[#181818] hover:text-[#FAFAFA]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="md:pl-64">
        <div className="mx-auto min-h-screen w-full max-w-7xl px-4 py-16 md:px-8 md:py-10">{children}</div>
      </main>
    </div>
  );
}
