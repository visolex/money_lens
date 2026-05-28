"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { AppShell } from "@/components/app-shell";
import { SectionCard } from "@/components/section-card";
import { CATEGORIES } from "@/lib/constants";
import { currency, getCategoryTotals, getMonthlyTotals, getTotalExpenses } from "@/lib/finance";
import { readData } from "@/lib/storage";
import { useMemo } from "react";
import type { MoneyLensData } from "@/lib/types";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function ReportsPage() {
  const data = readData() as MoneyLensData;

  const totalExpenses = useMemo(() => getTotalExpenses(data.expenses), [data.expenses]);
  const remainingBalance = data.monthlyIncome - totalExpenses;
  const categoryTotals = getCategoryTotals(data.expenses);
  const monthly = getMonthlyTotals(data.expenses);

  const highestCategory = CATEGORIES.reduce(
    (highest, category) =>
      categoryTotals[category] > categoryTotals[highest] ? category : highest,
    CATEGORIES[0],
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Total Income", value: currency.format(data.monthlyIncome) },
            { label: "Total Expenses", value: currency.format(totalExpenses) },
            { label: "Remaining Balance", value: currency.format(remainingBalance) },
            { label: "Highest Spending Category", value: highestCategory },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-[#222222] bg-[#111111] p-5">
              <p className="text-sm text-[#A1A1AA]">{item.label}</p>
              <p className="mt-2 text-xl font-semibold">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard title="Spending By Category">
            <div className="mx-auto max-w-xs">
              <Pie
                data={{
                  labels: CATEGORIES,
                  datasets: [
                    {
                      data: CATEGORIES.map((category) => categoryTotals[category]),
                      backgroundColor: [
                        "#E4E4E7",
                        "#D4D4D8",
                        "#A1A1AA",
                        "#71717A",
                        "#52525B",
                        "#3F3F46",
                        "#27272A",
                      ],
                      borderWidth: 0,
                    },
                  ],
                }}
              />
            </div>
          </SectionCard>

          <SectionCard title="Monthly Trends">
            <Bar
              data={{
                labels: monthly.map((item) => item.month),
                datasets: [
                  {
                    label: "Spending",
                    data: monthly.map((item) => item.total),
                    backgroundColor: "#D4D4D8",
                    borderRadius: 4,
                  },
                ],
              }}
              options={{ plugins: { legend: { display: false } } }}
            />
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
