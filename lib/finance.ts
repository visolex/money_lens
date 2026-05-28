import { CATEGORIES } from "@/lib/constants";
import type { Expense, ExpenseCategory, MoneyLensData } from "@/lib/types";

export const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
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

export const getHealthScore = (data: MoneyLensData) => {
  const totalExpenses = getTotalExpenses(data.expenses);
  const balance = data.monthlyIncome - totalExpenses;
  const savingsRate = data.monthlyIncome > 0 ? Math.max(balance, 0) / data.monthlyIncome : 0;

  const monthly = getMonthlyTotals(data.expenses);
  const average = monthly.length
    ? monthly.reduce((sum, item) => sum + item.total, 0) / monthly.length
    : 0;
  const variance = monthly.length
    ? monthly.reduce((sum, item) => sum + (item.total - average) ** 2, 0) / monthly.length
    : 0;
  const stdDev = Math.sqrt(variance);
  const consistency = average > 0 ? Math.max(0, 1 - stdDev / average) : 1;

  const categoryTotals = getCategoryTotals(data.expenses);
  const entertainmentRatio = totalExpenses ? categoryTotals.Entertainment / totalExpenses : 0;
  const subscriptionRatio = totalExpenses ? categoryTotals.Subscriptions / totalExpenses : 0;

  let score = 45;
  score += savingsRate * 35;
  score += consistency * 20;

  if (balance < 0) {
    score -= Math.min(25, Math.abs((balance / data.monthlyIncome) * 30));
  }
  if (entertainmentRatio > 0.2) {
    score -= (entertainmentRatio - 0.2) * 70;
  }
  if (subscriptionRatio > 0.12) {
    score -= (subscriptionRatio - 0.12) * 70;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
};

export const getHealthLabel = (score: number) => {
  if (score >= 90) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Average";
  return "Needs Improvement";
};

export const getInsights = (data: MoneyLensData): string[] => {
  const totalExpenses = getTotalExpenses(data.expenses);
  const categoryTotals = getCategoryTotals(data.expenses);
  const balance = data.monthlyIncome - totalExpenses;
  const savingsRate = data.monthlyIncome > 0 ? Math.max(balance, 0) / data.monthlyIncome : 0;

  const recommendations: string[] = [];

  const foodRatio = totalExpenses ? categoryTotals.Food / totalExpenses : 0;
  if (foodRatio > 0.3) {
    recommendations.push(
      "You are spending heavily on food. Reducing food delivery expenses may improve savings.",
    );
  }

  const entertainmentRatio = totalExpenses ? categoryTotals.Entertainment / totalExpenses : 0;
  if (entertainmentRatio > 0.2) {
    recommendations.push("Entertainment expenses are higher than recommended.");
  }

  if (savingsRate < 0.1) {
    recommendations.push("Your savings rate is below recommended levels.");
  }

  const subscriptionsRatio = totalExpenses ? categoryTotals.Subscriptions / totalExpenses : 0;
  if (subscriptionsRatio > 0.15) {
    recommendations.push("Your subscription spending is high. Review unused services this month.");
  }

  if (categoryTotals.Education < 80) {
    recommendations.push("Consider reserving a dedicated monthly amount for academic resources.");
  }

  if (recommendations.length < 3) {
    recommendations.push("Try setting weekly spending caps per category to improve budget consistency.");
    recommendations.push("Move a fixed amount into savings right after income arrives.");
  }

  return recommendations.slice(0, 5);
};
