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
import {
  currency,
  getCategoryTotals,
  getHealthLabel,
  getHealthScore,
  getInsights,
  getMonthlyTotals,
  getTotalExpenses,
} from "@/lib/finance";
import { readData } from "@/lib/storage";
import { useMemo } from "react";
import type { MoneyLensData } from "@/lib/types";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function DashboardPage() {
  const data = readData() as MoneyLensData;

  const totalExpenses = useMemo(() => getTotalExpenses(data.expenses), [data.expenses]);
  const remaining = data.monthlyIncome - totalExpenses;
  const score = getHealthScore(data);
  const insights = getInsights(data);
  const categories = getCategoryTotals(data.expenses);
  const monthly = getMonthlyTotals(data.expenses);

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Monthly Income", value: currency.format(data.monthlyIncome) },
            { label: "Monthly Expenses", value: currency.format(totalExpenses) },
            { label: "Remaining Balance", value: currency.format(remaining) },
            { label: "Financial Health Score", value: `${score} • ${getHealthLabel(score)}` },
          ].map((card) => (
            <div key={card.label} className="rounded-xl border border-[#222222] bg-[#111111] p-5">
              <p className="text-sm text-[#A1A1AA]">{card.label}</p>
              <p className="mt-2 text-xl font-semibold">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard title="Expense Breakdown" subtitle="Category-wise distribution">
            <div className="mx-auto max-w-xs">
              <Pie
                data={{
                  labels: CATEGORIES,
                  datasets: [
                    {
                      data: CATEGORIES.map((cat) => categories[cat]),
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

          <SectionCard title="Monthly Spending Trend" subtitle="Spending by month">
            <Bar
              data={{
                labels: monthly.map((item) => item.month),
                datasets: [
                  {
                    label: "Monthly Spend",
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

        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard title="Recent Transactions" subtitle="Latest expenses">
            {data.expenses.length === 0 ? (
              <p className="text-sm text-[#A1A1AA]">No expenses yet. Add your first transaction.</p>
            ) : (
              <ul className="space-y-3">
                {data.expenses
                  .slice()
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .slice(0, 6)
                  .map((expense) => (
                    <li key={expense.id} className="flex items-center justify-between rounded-md bg-[#151515] px-3 py-2">
                      <div>
                        <p className="text-sm">{expense.description}</p>
                        <p className="text-xs text-[#A1A1AA]">
                          {expense.category} • {expense.date}
                        </p>
                      </div>
                      <span className="text-sm">{currency.format(expense.amount)}</span>
                    </li>
                  ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="AI Insights Panel" subtitle="Rule-based personalized recommendations">
            <ul className="space-y-3 text-sm text-[#D4D4D8]">
              {insights.map((insight) => (
                <li key={insight} className="rounded-md bg-[#151515] px-3 py-2">
                  {insight}
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
