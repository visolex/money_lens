"use client";

import { AppShell } from "@/components/app-shell";
import { currency, getPurchaseAdvice, getSavingsRate } from "@/lib/finance";
import { readData } from "@/lib/storage";
import { useState } from "react";

type Advice = ReturnType<typeof getPurchaseAdvice> & {
  productName: string;
};

export default function PurchaseAdvisorPage() {
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [advice, setAdvice] = useState<Advice | null>(null);

  const data = readData();
  const savingsRate = Math.round(getSavingsRate(data) * 100);

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Purchase Advisor</h1>

        <section className="rounded-xl border border-[#222222] bg-[#111111] p-6">
          <p className="text-sm text-[#A1A1AA]">Monthly Budget: {currency.format(data.monthlyBudget)}</p>
          <p className="text-sm text-[#A1A1AA]">Current Savings Rate: {savingsRate}%</p>

          <form
            className="mt-4 grid gap-4 md:grid-cols-3"
            onSubmit={(e) => {
              e.preventDefault();
              const price = Number(productPrice);
              if (!productName.trim() || !price) {
                return;
              }

              const result = getPurchaseAdvice(data, price);
              setAdvice({ ...result, productName: productName.trim() });
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
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-[#222222] bg-[#111111] p-5">
              <p className="text-sm text-[#A1A1AA]">Risk Level</p>
              <p className="mt-2 text-xl font-semibold">{advice.riskLevel}</p>
            </div>
            <div className="rounded-xl border border-[#222222] bg-[#111111] p-5">
              <p className="text-sm text-[#A1A1AA]">Affordability Score</p>
              <p className="mt-2 text-xl font-semibold">{advice.affordabilityScore}/100</p>
            </div>
            <div className="rounded-xl border border-[#222222] bg-[#111111] p-5">
              <p className="text-sm text-[#A1A1AA]">Remaining Balance</p>
              <p className="mt-2 text-xl font-semibold">{currency.format(advice.remainingBalance)}</p>
            </div>
            <div className="rounded-xl border border-[#222222] bg-[#111111] p-5">
              <p className="text-sm text-[#A1A1AA]">Recovery Time Estimate</p>
              <p className="mt-2 text-xl font-semibold">
                {advice.recoveryMonths === null
                  ? "Not predictable"
                  : `${advice.recoveryMonths} month${advice.recoveryMonths > 1 ? "s" : ""}`}
              </p>
            </div>

            <div className="rounded-xl border border-[#222222] bg-[#111111] p-6 md:col-span-2 xl:col-span-4">
              <h2 className="text-lg font-semibold">{advice.productName}</h2>
              <p className="mt-2 text-sm text-[#D4D4D8]">{advice.recommendation}</p>
              <p className="mt-2 text-sm text-[#A1A1AA]">
                This purchase will consume {advice.consumptionRatio}% of your monthly balance.
              </p>
            </div>
          </section>
        ) : (
          <section className="rounded-xl border border-[#222222] bg-[#111111] p-6 text-sm text-[#A1A1AA]">
            Enter a product and amount to receive intelligent affordability guidance.
          </section>
        )}
      </div>
    </AppShell>
  );
}
