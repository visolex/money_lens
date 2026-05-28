"use client";

import { AppShell } from "@/components/app-shell";
import { currency, getTotalExpenses } from "@/lib/finance";
import { readData } from "@/lib/storage";
import { useMemo, useState } from "react";

type Advice = {
  canAfford: boolean;
  remainingAfterPurchase: number;
  recommendation: string;
};

export default function PurchaseAdvisorPage() {
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [advice, setAdvice] = useState<Advice | null>(null);

  const data = useMemo(() => readData(), []);
  const currentBalance = data.monthlyIncome - getTotalExpenses(data.expenses);
  const goalGap = data.goals.reduce(
    (sum, goal) => sum + Math.max(goal.targetAmount - goal.currentAmount, 0),
    0,
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Purchase Advisor</h1>

        <section className="rounded-xl border border-[#222222] bg-[#111111] p-6">
          <p className="text-sm text-[#A1A1AA]">Current Balance: {currency.format(currentBalance)}</p>
          <p className="text-sm text-[#A1A1AA]">Savings Goal Gap: {currency.format(goalGap)}</p>

          <form
            className="mt-4 grid gap-4 md:grid-cols-3"
            onSubmit={(e) => {
              e.preventDefault();
              const price = Number(productPrice);
              if (!productName.trim() || !price) {
                return;
              }

              const remainingAfterPurchase = currentBalance - price;
              const canAfford = remainingAfterPurchase >= 0;
              const savingsImpact = currentBalance > 0 ? Math.round((price / currentBalance) * 100) : 100;

              let recommendation: string;
              if (!canAfford) {
                recommendation = `You cannot afford ${productName} right now. It exceeds your available balance.`;
              } else if (remainingAfterPurchase < goalGap * 0.3) {
                recommendation = `You can afford this purchase, but it will reduce your savings by ${savingsImpact}% and slow your goals.`;
              } else {
                recommendation = `You can afford this purchase with manageable impact on your monthly budget.`;
              }

              setAdvice({ canAfford, remainingAfterPurchase, recommendation });
            }}
          >
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Product name"
              className="rounded-md border border-[#222222] bg-[#0A0A0A] px-3 py-2 text-sm outline-none transition focus:border-[#D4D4D8]"
            />
            <input
              type="number"
              min="0"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              placeholder="Product price"
              className="rounded-md border border-[#222222] bg-[#0A0A0A] px-3 py-2 text-sm outline-none transition focus:border-[#D4D4D8]"
            />
            <button
              type="submit"
              className="rounded-md bg-[#FAFAFA] px-4 py-2 text-sm font-medium text-[#111111] transition hover:opacity-90"
            >
              Analyze Purchase
            </button>
          </form>
        </section>

        {advice ? (
          <section className="rounded-xl border border-[#222222] bg-[#111111] p-6">
            <p className="text-sm text-[#A1A1AA]">Decision</p>
            <h2 className="mt-1 text-xl font-semibold">
              {advice.canAfford ? "Can Afford" : "Cannot Afford"}
            </h2>
            <p className="mt-3 text-sm text-[#D4D4D8]">
              Remaining Balance After Purchase: {currency.format(advice.remainingAfterPurchase)}
            </p>
            <p className="mt-2 text-sm text-[#D4D4D8]">{advice.recommendation}</p>
          </section>
        ) : (
          <section className="rounded-xl border border-[#222222] bg-[#111111] p-6 text-sm text-[#A1A1AA]">
            Enter a product and amount to receive a smart recommendation.
          </section>
        )}
      </div>
    </AppShell>
  );
}
