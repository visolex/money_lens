"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { readData, setBudget, setSmartDistributionEnabled } from "@/lib/storage";
import { currency } from "@/lib/finance";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/add-expense", label: "Add Expense" },
  { href: "/reports", label: "Reports" },
  { href: "/savings-goals", label: "Savings Goals" },
  { href: "/purchase-advisor", label: "Purchase Advisor" },
  { href: "/subscriptions", label: "Subscriptions" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [budgetInput, setBudgetInput] = useState("20000");
  const [enableSmart, setEnableSmart] = useState(true);

  useEffect(() => {
    const data = readData();
    setShowOnboarding(!data.hasOnboarded);
    if (data.monthlyBudget > 0) {
      setBudgetInput(String(data.monthlyBudget));
      setEnableSmart(data.smartDistributionEnabled);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA]">
      {showOnboarding ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#222222] bg-[#111111] p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.24em] text-[#A1A1AA]">Welcome to MoneyLens</p>
            <h2 className="mt-2 text-2xl font-semibold">What is your monthly budget?</h2>
            <p className="mt-2 text-sm text-[#A1A1AA]">
              Set a realistic monthly budget in INR to activate your personalized finance engine.
            </p>
            <label className="mt-5 block text-sm text-[#A1A1AA]">
              Monthly Budget
              <input
                type="number"
                min="1"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className="mt-2 w-full rounded-md border border-[#222222] bg-[#0A0A0A] px-3 py-2 text-[#FAFAFA] outline-none focus:border-[#D4D4D8]"
              />
            </label>
            <label className="mt-4 flex items-center justify-between rounded-md border border-[#222222] bg-[#0A0A0A] px-3 py-2 text-sm">
              Enable Smart Budget Distribution
              <input
                type="checkbox"
                checked={enableSmart}
                onChange={(e) => setEnableSmart(e.target.checked)}
                className="h-4 w-4"
              />
            </label>
            <div className="mt-4 rounded-md bg-[#151515] px-3 py-2 text-sm text-[#D4D4D8]">
              Suggested start: {currency.format(Number(budgetInput) || 0)}
            </div>
            <button
              className="mt-6 w-full rounded-md bg-[#FAFAFA] px-4 py-2 text-sm font-medium text-[#111111] transition hover:opacity-90"
              onClick={() => {
                const budget = Number(budgetInput);
                if (!budget || budget <= 0) return;
                setBudget(budget, false);
                setSmartDistributionEnabled(enableSmart);
                setShowOnboarding(false);
              }}
            >
              Continue
            </button>
          </div>
        </div>
      ) : null}

      <button
        className="fixed left-4 top-4 z-50 rounded-md border border-[#222222] bg-[#111111] p-2 md:hidden"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle navigation"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-[#222222] bg-[#111111] p-6 transition-transform duration-300 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link href="/" className="mb-8 block text-lg font-semibold tracking-tight text-[#FAFAFA]">
          MoneyLens
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
