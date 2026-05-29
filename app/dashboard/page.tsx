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
  getHealthLabel,
  getHealthScore,
  getInsights,
  getMonthlyTotals,
  getSubscriptionMonthlyCost,
  getTotalExpenses,
} from "@/lib/finance";
import {
  addSubscription,
  addToBudget,
  deleteSubscription,
  readData,
  setMonthlyBudget,
  setSmartBudgetEnabled,
  updateAllocation,
} from "@/lib/storage";
import { useMemo, useState } from "react";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function DashboardPage() {
  const [data, setData] = useState(() => readData());
  const [topUpAmount, setTopUpAmount] = useState("");
  const [setupBudget, setSetupBudget] = useState("");
  const [setupSmart, setSetupSmart] = useState(true);
  const [subscriptionName, setSubscriptionName] = useState("");
  const [subscriptionMonthly, setSubscriptionMonthly] = useState("");

  const refresh = () => setData(readData());

  const monthExpensesList = useMemo(() => getCurrentMonthExpenses(data.expenses), [data.expenses]);
  const totalExpenses = useMemo(() => getTotalExpenses(monthExpensesList), [monthExpensesList]);
  const totalSubscriptions = useMemo(() => getSubscriptionMonthlyCost(data), [data]);
  const remaining = data.monthlyBudget - totalExpenses - totalSubscriptions;
  const score = getHealthScore(data);
  const insights = getInsights(data);
  const categories = getCategoryTotals(monthExpensesList);
  const monthly = getMonthlyTotals(data.expenses);
  const allocationPercentageTotal = data.allocations.reduce((sum, item) => sum + item.percentage, 0);

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
            <p className="text-sm text-[#A1A1AA]">Welcome to MoneyLens India</p>
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

      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Monthly Budget", value: currency.format(data.monthlyBudget) },
            { label: "This Month Expenses", value: currency.format(totalExpenses) },
            { label: "Monthly Subscriptions", value: currency.format(totalSubscriptions) },
            { label: "Remaining Balance", value: currency.format(remaining) },
          ].map((card) => (
            <div key={card.label} className="rounded-xl border border-[#222222] bg-[#111111] p-5">
              <p className="text-sm text-[#A1A1AA]">{card.label}</p>
              <p className="mt-2 text-xl font-semibold">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <SectionCard title="Financial Health" subtitle="Score out of 100 based on discipline and savings">
            <p className="text-3xl font-semibold">{score}</p>
            <p className="mt-1 text-sm text-[#A1A1AA]">{getHealthLabel(score)}</p>
            <p className="mt-3 text-sm text-[#D4D4D8]">Budget Efficiency: {getBudgetEfficiency(data)}%</p>
          </SectionCard>

          <SectionCard title="Update Budget" subtitle="Add amount to your current monthly budget">
            <div className="space-y-3">
              <input
                type="number"
                min="1"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                placeholder="Add amount"
                className="w-full rounded-md border border-[#222222] bg-[#0A0A0A] px-3 py-2"
              />
              <button
                onClick={() => {
                  const amount = Number(topUpAmount);
                  if (!amount || amount <= 0) {
                    return;
                  }
                  addToBudget(amount);
                  setTopUpAmount("");
                  refresh();
                }}
                className="w-full rounded-md bg-[#FAFAFA] px-4 py-2 text-sm font-medium text-[#111111]"
              >
                Update Budget
              </button>
            </div>
          </SectionCard>
        </div>

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

          <SectionCard title="Monthly Spending Trend" subtitle="Animated month-wise spending trend">
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
                      label: "Monthly Spend",
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
            <button className="rounded-md bg-[#FAFAFA] px-4 py-2 text-sm font-medium text-[#111111]">
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
                      className="rounded-md border border-[#222222] px-2 py-1 text-xs"
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
