"use client";

import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { AlertTriangle, Pencil, TrendingDown, TrendingUp } from "lucide-react";
import { Line, Pie } from "react-chartjs-2";
import { AppShell } from "@/components/app-shell";
import { SectionCard } from "@/components/section-card";
import { CATEGORIES } from "@/lib/constants";
import {
  currency,
  getBudgetEfficiency,
  getCategoryTotals,
  getCurrentMonthExpenses,
  getDailySpending,
  getHealthLabel,
  getHealthScore,
  getInsights,
  getMonthlyTotals,
  getSpendingForecast,
  getSubscriptionMonthlyCost,
  getTotalExpenses,
} from "@/lib/finance";
import {
  addSubscription,
  deleteSubscription,
  readData,
  setMonthlyBudget,
  setSmartBudgetEnabled,
  updateAllocation,
} from "@/lib/storage";
import { useEffect, useMemo, useState } from "react";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
);

type HeatmapView = "weekly" | "monthly";

const getCellColor = (value: number) => {
  if (value >= 1000) return "bg-[#E4E4E7]";
  if (value >= 600) return "bg-[#A1A1AA]";
  if (value >= 300) return "bg-[#71717A]";
  if (value >= 50) return "bg-[#3F3F46]";
  return "bg-[#1A1A1A]";
};

const buildHeatmapDates = (view: HeatmapView) => {
  const today = new Date();
  if (view === "monthly") {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(monthStart);
      date.setDate(monthStart.getDate() + i);
      return date;
    });
  }

  const start = new Date(today);
  start.setDate(today.getDate() - 55);
  return Array.from({ length: 56 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return date;
  });
};

export default function DashboardPage() {
  const [data, setData] = useState(() => readData());
  const [setupBudget, setSetupBudget] = useState("");
  const [setupSmart, setSetupSmart] = useState(true);
  const [subscriptionName, setSubscriptionName] = useState("");
  const [subscriptionMonthly, setSubscriptionMonthly] = useState("");
  const [heatmapView, setHeatmapView] = useState<HeatmapView>("monthly");
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editedBudget, setEditedBudget] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const refresh = () => setData(readData());

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 250);
    return () => window.clearTimeout(timer);
  }, []);

  const monthExpensesList = useMemo(() => getCurrentMonthExpenses(data.expenses), [data.expenses]);
  const totalExpenses = useMemo(() => getTotalExpenses(monthExpensesList), [monthExpensesList]);
  const totalSubscriptions = useMemo(() => getSubscriptionMonthlyCost(data), [data]);
  const remaining = data.monthlyBudget - totalExpenses - totalSubscriptions;
  const score = getHealthScore(data);
  const insights = getInsights(data);
  const categories = getCategoryTotals(monthExpensesList);
  const monthly = getMonthlyTotals(data.expenses);
  const dailySpending = useMemo(() => getDailySpending(data.expenses), [data.expenses]);
  const forecast = useMemo(() => getSpendingForecast(data), [data]);
  const allocationPercentageTotal = data.allocations.reduce((sum, item) => sum + item.percentage, 0);

  const heatmapDates = useMemo(() => buildHeatmapDates(heatmapView), [heatmapView]);
  const heatmapPeakDay = useMemo(() => {
    const entries = [...dailySpending.entries()].sort(([, a], [, b]) => b - a);
    return entries[0] ?? null;
  }, [dailySpending]);
  const emptyCharts = monthExpensesList.length === 0;

  return (
    <AppShell>
      {data.monthlyBudget <= 0 ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <form
            className="w-full max-w-md rounded-2xl border border-[#222222] bg-[#111111] p-6"
            onSubmit={(e) => {
              e.preventDefault();
              const budget = Number(setupBudget);
              if (!budget || budget <= 0) {
                return;
              }
              setMonthlyBudget(budget);
              setSmartBudgetEnabled(setupSmart);
              setSetupBudget("");
              refresh();
            }}
          >
            <p className="text-sm text-[#A1A1AA]">Welcome to MoneyLens</p>
            <h2 className="mt-2 text-2xl font-semibold">What is your monthly budget?</h2>
            <input
              type="number"
              min="1"
              value={setupBudget}
              onChange={(e) => setSetupBudget(e.target.value)}
              placeholder="Example: 20000"
              className="mt-4 w-full rounded-md border border-[#222222] bg-[#0A0A0A] px-3 py-2"
            />
            <label className="mt-4 flex items-center gap-2 text-sm text-[#D4D4D8]">
              <input
                type="checkbox"
                checked={setupSmart}
                onChange={(e) => setSetupSmart(e.target.checked)}
              />
              Enable Smart Budget Distribution
            </label>
            <button className="mt-5 w-full rounded-md bg-[#FAFAFA] px-4 py-2 text-sm font-medium text-[#111111]">
              Start Tracking
            </button>
          </form>
        </div>
      ) : null}

      {showBudgetModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#2A2A2A] bg-[#111111] p-6">
            <h2 className="text-xl font-semibold">Edit Budget</h2>
            <p className="mt-1 text-sm text-[#A1A1AA]">Set your latest monthly budget and recalculate analytics.</p>
            <input
              type="number"
              min="1"
              value={editedBudget}
              onChange={(e) => setEditedBudget(e.target.value)}
              className="mt-4 w-full rounded-md border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-2"
              placeholder="Enter new monthly budget"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowBudgetModal(false)}
                className="rounded-md border border-[#2A2A2A] px-4 py-2 text-sm text-[#D4D4D8] transition hover:bg-[#1A1A1A]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const value = Number(editedBudget);
                  if (!value || value <= 0) return;
                  setMonthlyBudget(value);
                  setShowBudgetModal(false);
                  setEditedBudget("");
                  refresh();
                }}
                className="rounded-md bg-[#FAFAFA] px-4 py-2 text-sm font-medium text-[#111111] transition hover:opacity-90"
              >
                Save Budget
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-xl border border-[#222222] bg-[#111111]" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Monthly Budget", value: currency.format(data.monthlyBudget) },
              { label: "This Month Expenses", value: currency.format(totalExpenses) },
              { label: "Monthly Subscriptions", value: currency.format(totalSubscriptions) },
              { label: "Remaining Balance", value: currency.format(remaining) },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-[#222222] bg-[#111111] p-5 transition-all hover:-translate-y-0.5 hover:border-[#3A3A3A]"
              >
                <p className="text-sm text-[#A1A1AA]">{card.label}</p>
                <p className="mt-2 text-xl font-semibold">{card.value}</p>
              </div>
            ))}
          </div>
        )}

        <SectionCard title="Spending Forecast" subtitle="Intelligent prediction based on current monthly behavior">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Current Budget", value: currency.format(data.monthlyBudget) },
              { label: "Current Spending", value: currency.format(forecast.currentSpending) },
              { label: "Average Daily Spending", value: `${currency.format(Math.round(forecast.averageDailySpending))}/day` },
              { label: "Predicted Month-End Balance", value: currency.format(Math.round(forecast.predictedMonthEndBalance)) },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-[#2A2A2A] bg-[#141414] p-4">
                <p className="text-xs uppercase tracking-wide text-[#71717A]">{item.label}</p>
                <p className="mt-2 text-lg font-semibold">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <div className="inline-flex items-center gap-2 rounded-md border border-[#2A2A2A] bg-[#151515] px-3 py-2">
              {forecast.paceDelta > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>
                {forecast.paceDelta > 0 ? "Above ideal pace" : "Within ideal pace"} by{" "}
                {currency.format(Math.round(Math.abs(forecast.paceDelta)))}
              </span>
            </div>
            <div className="rounded-md border border-[#2A2A2A] bg-[#151515] px-3 py-2 text-[#A1A1AA]">
              {forecast.daysRemaining} day{forecast.daysRemaining === 1 ? "" : "s"} left this month
            </div>
          </div>

          {forecast.isLikelyToExceed ? (
            <div className="mt-4 rounded-lg border border-[#3A3A3A] bg-[#171717] p-4 text-sm text-[#E4E4E7]">
              <p className="flex items-center gap-2 font-medium">
                <AlertTriangle size={16} /> Warning
              </p>
              <p className="mt-1 text-[#D4D4D8]">
                At your current spending rate, you may exceed your monthly budget in{" "}
                {Math.max(forecast.daysToExceedBudget ?? 0, 0)} day
                {Math.max(forecast.daysToExceedBudget ?? 0, 0) === 1 ? "" : "s"}.
              </p>
            </div>
          ) : null}
        </SectionCard>

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <SectionCard title="Financial Health" subtitle="Score out of 100 based on discipline and savings">
            <p className="text-3xl font-semibold">{score}</p>
            <p className="mt-1 text-sm text-[#A1A1AA]">{getHealthLabel(score)}</p>
            <p className="mt-3 text-sm text-[#D4D4D8]">Budget Efficiency: {getBudgetEfficiency(data)}%</p>
          </SectionCard>

          <SectionCard title="Edit Budget" subtitle="Modify your monthly budget at any time">
            <button
              onClick={() => {
                setEditedBudget(String(data.monthlyBudget));
                setShowBudgetModal(true);
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#FAFAFA] px-4 py-2 text-sm font-medium text-[#111111] transition hover:opacity-90"
            >
              <Pencil size={14} /> Edit Budget
            </button>
          </SectionCard>
        </div>

        <SectionCard title="Expense Heatmap" subtitle="Visualize spending intensity by date">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-md border border-[#2A2A2A] bg-[#151515] p-1 text-sm">
              <button
                onClick={() => setHeatmapView("weekly")}
                className={`rounded px-3 py-1 transition ${
                  heatmapView === "weekly" ? "bg-[#262626] text-[#FAFAFA]" : "text-[#A1A1AA] hover:text-[#FAFAFA]"
                }`}
              >
                Weekly view
              </button>
              <button
                onClick={() => setHeatmapView("monthly")}
                className={`rounded px-3 py-1 transition ${
                  heatmapView === "monthly" ? "bg-[#262626] text-[#FAFAFA]" : "text-[#A1A1AA] hover:text-[#FAFAFA]"
                }`}
              >
                Monthly view
              </button>
            </div>
            <div className="text-sm text-[#A1A1AA]">
              Peak day:{" "}
              {heatmapPeakDay
                ? `${heatmapPeakDay[0]} (${currency.format(Math.round(heatmapPeakDay[1]))})`
                : "No spending data yet"}
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {heatmapDates.map((date) => {
              const key = date.toISOString().slice(0, 10);
              const value = dailySpending.get(key) ?? 0;
              return (
                <div
                  key={key}
                  title={`${key}: ${currency.format(Math.round(value))}`}
                  className={`h-8 rounded-md border border-[#2A2A2A] transition hover:scale-105 ${getCellColor(value)}`}
                />
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#A1A1AA]">
            <span className="rounded bg-[#1A1A1A] px-2 py-1">Low: ₹50+</span>
            <span className="rounded bg-[#3F3F46] px-2 py-1">Medium: ₹300+</span>
            <span className="rounded bg-[#71717A] px-2 py-1">High: ₹600+</span>
            <span className="rounded bg-[#E4E4E7] px-2 py-1 text-[#111111]">Peak: ₹1000+</span>
          </div>
        </SectionCard>

        <SectionCard title="Smart Budget Distribution" subtitle="Enable, tweak, and track your recommended allocation model">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-[#D4D4D8]">
              <input
                type="checkbox"
                checked={data.smartBudgetEnabled}
                onChange={(e) => {
                  setSmartBudgetEnabled(e.target.checked);
                  refresh();
                }}
              />
              Smart Budget Distribution
            </label>
            <p className="text-xs text-[#A1A1AA]">Total allocation: {allocationPercentageTotal}%</p>
          </div>

          {data.smartBudgetEnabled ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {data.allocations.map((allocation) => (
                <div key={allocation.category} className="rounded-xl border border-[#222222] bg-[#151515] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{allocation.category}</p>
                    <div
                      className="h-9 w-9 rounded-full"
                      style={{
                        background: `conic-gradient(#D4D4D8 ${allocation.percentage * 3.6}deg, #2A2A2A 0deg)`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-[#A1A1AA]">{currency.format(allocation.amount)}</p>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#1C1C1C]">
                    <div className="h-full bg-[#D4D4D8] transition-all" style={{ width: `${allocation.percentage}%` }} />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={allocation.percentage}
                      onChange={(e) => {
                        updateAllocation(allocation.category, Number(e.target.value));
                        refresh();
                      }}
                      className="w-16 rounded-md border border-[#222222] bg-[#0A0A0A] px-2 py-1 text-xs"
                    />
                    <span className="text-xs text-[#A1A1AA]">%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#A1A1AA]">Enable smart distribution to auto-plan Needs, Savings, Education, Entertainment, and Emergency.</p>
          )}
        </SectionCard>

        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard title="Expense Breakdown" subtitle="Category-wise distribution for this month">
            {emptyCharts ? (
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
                        data: CATEGORIES.map((cat) => categories[cat]),
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

          <SectionCard title="Monthly Spending Trend" subtitle="Month-wise spending momentum">
            {monthly.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#2A2A2A] bg-[#131313] p-8 text-center text-sm text-[#A1A1AA]">
                Start tracking your spending to generate reports.
              </div>
            ) : (
              <Line
                data={{
                  labels: monthly.map((item) => item.month),
                  datasets: [
                    {
                      label: "Monthly Spend",
                      data: monthly.map((item) => item.total),
                      borderColor: "#D4D4D8",
                      backgroundColor: "rgba(212,212,216,0.25)",
                      tension: 0.35,
                      fill: true,
                      pointRadius: 3,
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

        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard title="Recent Transactions" subtitle="Latest expenses in INR">
            {data.expenses.length === 0 ? (
              <p className="text-sm text-[#A1A1AA]">No expenses added yet.</p>
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

          <SectionCard title="AI Insights Engine" subtitle="Rule-based financial recommendations">
            <div className="space-y-3">
              {insights.map((insight) => (
                <div key={insight} className="rounded-md border border-[#222222] bg-[#151515] px-3 py-3 text-sm text-[#D4D4D8]">
                  {insight}
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Subscription Tracker" subtitle="Track recurring monthly and yearly subscription costs">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const monthlyCost = Number(subscriptionMonthly);
              if (!subscriptionName.trim() || !monthlyCost || monthlyCost <= 0) {
                return;
              }
              addSubscription({ name: subscriptionName.trim(), monthlyCost });
              setSubscriptionName("");
              setSubscriptionMonthly("");
              refresh();
            }}
            className="grid gap-3 md:grid-cols-3"
          >
            <input
              value={subscriptionName}
              onChange={(e) => setSubscriptionName(e.target.value)}
              placeholder="Netflix / Spotify / Prime Video"
              className="rounded-md border border-[#222222] bg-[#0A0A0A] px-3 py-2 text-sm"
            />
            <input
              type="number"
              min="1"
              value={subscriptionMonthly}
              onChange={(e) => setSubscriptionMonthly(e.target.value)}
              placeholder="Monthly cost"
              className="rounded-md border border-[#222222] bg-[#0A0A0A] px-3 py-2 text-sm"
            />
            <button className="rounded-md bg-[#FAFAFA] px-4 py-2 text-sm font-medium text-[#111111] transition hover:opacity-90">
              Add Subscription
            </button>
          </form>

          {data.subscriptions.length === 0 ? (
            <p className="mt-4 text-sm text-[#A1A1AA]">No recurring subscriptions added yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {data.subscriptions.map((subscription) => (
                <li key={subscription.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-[#151515] p-3 text-sm">
                  <p>{subscription.name}</p>
                  <div className="flex items-center gap-3 text-[#A1A1AA]">
                    <span>Monthly: {currency.format(subscription.monthlyCost)}</span>
                    <span>Yearly: {currency.format(subscription.monthlyCost * 12)}</span>
                    <button
                      onClick={() => {
                        deleteSubscription(subscription.id);
                        refresh();
                      }}
                      className="rounded-md border border-[#222222] px-2 py-1 text-xs transition hover:bg-[#1C1C1C]"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
