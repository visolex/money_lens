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
  getBudgetEfficiency,
  getCategoryTotals,
  getCurrentMonthExpenses,
  getHealthScore,
  getHighestCategory,
  getMonthlyTotals,
  getSavingsRate,
  getSubscriptionMonthlyCost,
  getTotalExpenses,
} from "@/lib/finance";
import { readData, saveMonthlyReport } from "@/lib/storage";
import { useMemo, useState } from "react";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function ReportsPage() {
  const [data, setData] = useState(() => readData());

  const monthExpensesList = useMemo(() => getCurrentMonthExpenses(data.expenses), [data.expenses]);
  const totalExpenses = useMemo(() => getTotalExpenses(monthExpensesList), [monthExpensesList]);
  const categoryTotals = getCategoryTotals(monthExpensesList);
  const monthly = getMonthlyTotals(data.expenses);
  const highestCategory = getHighestCategory(monthExpensesList);
  const savingsPercentage = Math.round(getSavingsRate(data) * 100);
  const financialScore = getHealthScore(data);
  const budgetEfficiency = getBudgetEfficiency(data);
  const monthlySubscriptionCost = getSubscriptionMonthlyCost(data);

  const refresh = () => setData(readData());

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>

        <div className="rounded-xl border border-[#222222] bg-[#111111] p-6">
          <button
            onClick={() => {
              saveMonthlyReport({
                month: new Date().toISOString().slice(0, 7),
                totalExpenses: totalExpenses + monthlySubscriptionCost,
                highestCategory,
                savingsPercentage,
                budgetEfficiency,
                financialScore,
              });
              refresh();
            }}
            className="rounded-md bg-[#FAFAFA] px-4 py-2 text-sm font-medium text-[#111111]"
          >
            Generate Monthly Report
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Total Expenses", value: currency.format(totalExpenses + monthlySubscriptionCost) },
            { label: "Highest Spending Category", value: highestCategory },
            { label: "Savings Percentage", value: `${savingsPercentage}%` },
            { label: "Budget Efficiency", value: `${budgetEfficiency}%` },
            { label: "Financial Score", value: `${financialScore}/100` },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-[#222222] bg-[#111111] p-5">
              <p className="text-sm text-[#A1A1AA]">{item.label}</p>
              <p className="mt-2 text-lg font-semibold">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard title="Spending By Category">
            {monthExpensesList.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#2A2A2A] bg-[#131313] p-8 text-center text-sm text-[#A1A1AA]">
                No expenses added yet.
              </div>
            ) : (
              <div className="mx-auto max-w-xs">
                <Pie
                  data={{
                    labels: CATEGORIES,
                    datasets: [
                      {
                        data: CATEGORIES.map((category) => categoryTotals[category]),
                        backgroundColor: ["#E4E4E7", "#D4D4D8", "#A1A1AA", "#71717A", "#52525B", "#3F3F46", "#27272A"],
                        borderWidth: 0,
                      },
                    ],
                  }}
                  options={{ animation: { duration: 700 } }}
                />
              </div>
            )}
          </SectionCard>

          <SectionCard title="Monthly Trends">
            {monthly.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#2A2A2A] bg-[#131313] p-8 text-center text-sm text-[#A1A1AA]">
                Start tracking your spending to generate reports.
              </div>
            ) : (
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
                options={{
                  animation: { duration: 700 },
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { ticks: { color: "#A1A1AA" } },
                    y: { ticks: { color: "#A1A1AA" } },
                  },
                }}
              />
            )}
          </SectionCard>
        </div>

        <SectionCard title="Generated Reports" subtitle="Latest monthly summaries from localStorage">
          {data.reports.length === 0 ? (
            <p className="text-sm text-[#A1A1AA]">No report generated yet.</p>
          ) : (
            <div className="grid gap-3">
              {data.reports.map((report) => (
                <div key={report.id} className="rounded-lg border border-[#222222] bg-[#151515] p-4 text-sm">
                  <p className="font-medium">{report.month}</p>
                  <p className="mt-1 text-[#A1A1AA]">Total expenses: {currency.format(report.totalExpenses)}</p>
                  <p className="text-[#A1A1AA]">Highest category: {report.highestCategory}</p>
                  <p className="text-[#A1A1AA]">Savings: {report.savingsPercentage}%</p>
                  <p className="text-[#A1A1AA]">Budget efficiency: {report.budgetEfficiency}%</p>
                  <p className="text-[#A1A1AA]">Financial score: {report.financialScore}/100</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
