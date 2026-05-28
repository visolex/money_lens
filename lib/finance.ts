import { CATEGORIES, DEFAULT_ALLOCATION_TEMPLATE } from "@/lib/constants";
import type { BudgetAllocation, Expense, ExpenseCategory, MoneyLensData } from "@/lib/types";

export const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const getTotalExpenses = (expenses: Expense[]) =>
  expenses.reduce((sum, expense) => sum + expense.amount, 0);

export const getCategoryTotals = (expenses: Expense[]) => {
  const totals = Object.fromEntries(CATEGORIES.map((category) => [category, 0])) as Record<
    ExpenseCategory,
    number
  >;

  expenses.forEach((expense) => {
    totals[expense.category] += expense.amount;
  });

  return totals;
};

export const getMonthlyTotals = (expenses: Expense[]) => {
  const monthlyMap = new Map<string, number>();

  expenses.forEach((expense) => {
    const monthKey = expense.date.slice(0, 7);
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) ?? 0) + expense.amount);
  });

  return [...monthlyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }));
};

export const getCurrentMonthExpense = (expenses: Expense[]) => {
  const monthKey = new Date().toISOString().slice(0, 7);
  return expenses
    .filter((expense) => expense.date.startsWith(monthKey))
    .reduce((sum, expense) => sum + expense.amount, 0);
};

export const getMonthlyBalance = (data: MoneyLensData) => data.monthlyBudget - getCurrentMonthExpense(data.expenses);

export const withBudgetAmounts = (budget: number, allocations: BudgetAllocation[]): BudgetAllocation[] =>
  allocations.map((allocation) => ({
    ...allocation,
    amount: Math.round((budget * allocation.percentage) / 100),
  }));

export const getDefaultAllocations = (budget: number) =>
  withBudgetAmounts(budget, DEFAULT_ALLOCATION_TEMPLATE);

export const getSavingsRate = (data: MoneyLensData) => {
  if (data.monthlyBudget <= 0) return 0;
  return Math.max(getMonthlyBalance(data), 0) / data.monthlyBudget;
};

export const getHealthScore = (data: MoneyLensData) => {
  const totalExpenses = getCurrentMonthExpense(data.expenses);
  const balance = data.monthlyBudget - totalExpenses;
  const savingsRate = getSavingsRate(data);

  const monthly = getMonthlyTotals(data.expenses);
  const average = monthly.length
    ? monthly.reduce((sum, item) => sum + item.total, 0) / monthly.length
    : 0;
  const variance = monthly.length
    ? monthly.reduce((sum, item) => sum + (item.total - average) ** 2, 0) / monthly.length
    : 0;
  const stdDev = Math.sqrt(variance);
  const consistency = average > 0 ? Math.max(0, 1 - stdDev / average) : 0.7;

  const categoryTotals = getCategoryTotals(
    data.expenses.filter((expense) => expense.date.startsWith(new Date().toISOString().slice(0, 7))),
  );
  const entertainmentRatio = totalExpenses ? categoryTotals.Entertainment / totalExpenses : 0;
  const subscriptionRatio = totalExpenses ? categoryTotals.Subscriptions / totalExpenses : 0;

  let score = 40;
  score += savingsRate * 30;
  score += consistency * 20;
  score += Math.min(15, (data.monthlyBudget > 0 ? Math.max(balance, 0) / data.monthlyBudget : 0) * 15);

  if (balance < 0) score -= 25;
  if (entertainmentRatio > 0.2) score -= (entertainmentRatio - 0.2) * 70;
  if (subscriptionRatio > 0.12) score -= (subscriptionRatio - 0.12) * 70;

  return Math.max(0, Math.min(100, Math.round(score)));
};

export const getHealthLabel = (score: number) => {
  if (score >= 90) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Average";
  return "Needs Improvement";
};

export const getInsights = (data: MoneyLensData): string[] => {
  const monthlyExpenses = data.expenses.filter((expense) =>
    expense.date.startsWith(new Date().toISOString().slice(0, 7)),
  );
  const totalExpenses = getTotalExpenses(monthlyExpenses);
  const categoryTotals = getCategoryTotals(monthlyExpenses);
  const balance = data.monthlyBudget - totalExpenses;
  const savingsRate = data.monthlyBudget > 0 ? Math.max(balance, 0) / data.monthlyBudget : 0;

  const insights: string[] = [];

  const foodRatio = totalExpenses ? categoryTotals.Food / totalExpenses : 0;
  if (foodRatio > 0.3) {
    insights.push("You are spending heavily on food delivery this month.");
  }

  const entertainmentRatio = totalExpenses ? categoryTotals.Entertainment / totalExpenses : 0;
  if (entertainmentRatio > 0.2) {
    insights.push("Entertainment expenses are higher than recommended.");
  }

  if (savingsRate < 0.1) {
    insights.push("Your savings rate is below healthy levels.");
  }

  const subscriptionsRatio = totalExpenses ? categoryTotals.Subscriptions / totalExpenses : 0;
  if (subscriptionsRatio > 0.15) {
    insights.push("Subscription costs are high. Cancel unused plans to recover budget.");
  }

  if (data.smartDistributionEnabled) {
    const entertainmentAllocation = data.allocations.find((item) => item.category === "Entertainment");
    if (entertainmentAllocation && categoryTotals.Entertainment > entertainmentAllocation.amount) {
      insights.push("Entertainment spend is above your smart allocation target.");
    }
  }

  if (insights.length < 3) {
    insights.push("Great momentum: keep logging expenses weekly to improve forecast accuracy.");
    insights.push("Set fixed contribution reminders for goals to accelerate savings progress.");
    insights.push("Review top 3 expenses every weekend to stay on budget.");
  }

  return insights.slice(0, 5);
};

export const getGoalEtaMonths = (data: MoneyLensData, remainingAmount: number) => {
  const monthlySavings = Math.max(getMonthlyBalance(data), 0);
  if (monthlySavings <= 0) return null;
  return Math.max(1, Math.ceil(remainingAmount / monthlySavings));
};
