import { CATEGORIES } from "@/lib/constants";
import type {
  Expense,
  ExpenseCategory,
  MoneyLensData,
  SavingsGoal,
} from "@/lib/types";

export const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const getCurrentMonthKey = () => new Date().toISOString().slice(0, 7);

export const getTotalExpenses = (expenses: Expense[]) =>
  expenses.reduce((sum, expense) => sum + expense.amount, 0);

export const getCurrentMonthExpenses = (expenses: Expense[]) => {
  const month = getCurrentMonthKey();
  return expenses.filter((expense) => expense.date.startsWith(month));
};

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

export const getSubscriptionMonthlyCost = (data: MoneyLensData) =>
  data.subscriptions.reduce((sum, subscription) => sum + subscription.monthlyCost, 0);

export const getSavingsRate = (data: MoneyLensData) => {
  const monthExpenses = getTotalExpenses(getCurrentMonthExpenses(data.expenses));
  const monthlySubscription = getSubscriptionMonthlyCost(data);
  const remaining = data.monthlyBudget - monthExpenses - monthlySubscription;
  return data.monthlyBudget > 0 ? Math.max(remaining, 0) / data.monthlyBudget : 0;
};

export const getHealthScore = (data: MoneyLensData) => {
  if (data.monthlyBudget <= 0) {
    return 0;
  }

  const monthExpenses = getTotalExpenses(getCurrentMonthExpenses(data.expenses));
  const monthlySubscription = getSubscriptionMonthlyCost(data);
  const spending = monthExpenses + monthlySubscription;
  const savingsRate = getSavingsRate(data);

  const monthly = getMonthlyTotals(data.expenses);
  const average = monthly.length
    ? monthly.reduce((sum, item) => sum + item.total, 0) / monthly.length
    : 0;
  const variance = monthly.length
    ? monthly.reduce((sum, item) => sum + (item.total - average) ** 2, 0) / monthly.length
    : 0;
  const consistency = average > 0 ? Math.max(0, 1 - Math.sqrt(variance) / average) : 0.5;

  const categoryTotals = getCategoryTotals(getCurrentMonthExpenses(data.expenses));
  const entertainmentRatio = monthExpenses ? categoryTotals.Entertainment / monthExpenses : 0;
  const subscriptionsRatio = spending ? monthlySubscription / spending : 0;
  const overspendRatio = spending > data.monthlyBudget ? (spending - data.monthlyBudget) / data.monthlyBudget : 0;

  let score = 58;
  score += savingsRate * 28;
  score += consistency * 16;
  score -= overspendRatio * 40;

  if (entertainmentRatio > 0.2) {
    score -= (entertainmentRatio - 0.2) * 50;
  }
  if (subscriptionsRatio > 0.12) {
    score -= (subscriptionsRatio - 0.12) * 55;
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
  const monthExpensesList = getCurrentMonthExpenses(data.expenses);
  const monthExpenses = getTotalExpenses(monthExpensesList);
  const categoryTotals = getCategoryTotals(monthExpensesList);
  const savingsRate = getSavingsRate(data);
  const subscriptionCost = getSubscriptionMonthlyCost(data);
  const spendingWithSubs = monthExpenses + subscriptionCost;

  const insights: string[] = [];

  const foodRatio = monthExpenses ? categoryTotals.Food / monthExpenses : 0;
  if (foodRatio > 0.3) {
    insights.push("You are spending heavily on food delivery this month.");
  }

  const entertainmentRatio = monthExpenses ? categoryTotals.Entertainment / monthExpenses : 0;
  if (entertainmentRatio > 0.2) {
    insights.push("Entertainment expenses are higher than recommended.");
  }

  if (savingsRate < 0.1) {
    insights.push("Your savings rate is below healthy levels.");
  }

  const subscriptionRatio = spendingWithSubs ? subscriptionCost / spendingWithSubs : 0;
  if (subscriptionRatio > 0.15) {
    insights.push("Subscriptions are consuming a high share of your monthly spending.");
  }

  if (data.smartBudgetEnabled) {
    const savingsAllocation = data.allocations.find((allocation) => allocation.category === "Savings");
    if (savingsAllocation && savingsAllocation.percentage < 15) {
      insights.push("Consider increasing your Savings allocation to improve long-term stability.");
    }
  }

  if (insights.length < 3) {
    insights.push("Your spending looks balanced. Keep tracking consistently for stronger insights.");
  }
  if (insights.length < 4) {
    insights.push("Set weekly spending caps for non-essential categories to stay within budget.");
  }

  return insights.slice(0, 5);
};

export const getBudgetEfficiency = (data: MoneyLensData) => {
  if (data.monthlyBudget <= 0) {
    return 0;
  }
  const spending =
    getTotalExpenses(getCurrentMonthExpenses(data.expenses)) + getSubscriptionMonthlyCost(data);
  return Math.max(0, Math.min(100, Math.round(((data.monthlyBudget - Math.abs(data.monthlyBudget - spending)) / data.monthlyBudget) * 100)));
};

export const getHighestCategory = (expenses: Expense[]): ExpenseCategory | "None" => {
  if (!expenses.length) {
    return "None";
  }

  const categoryTotals = getCategoryTotals(expenses);
  return CATEGORIES.reduce(
    (highest, category) => (categoryTotals[category] > categoryTotals[highest] ? category : highest),
    CATEGORIES[0],
  );
};

export const getGoalCompletionMonths = (goal: SavingsGoal, monthlySavingRate: number) => {
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
  if (remaining <= 0) {
    return 0;
  }
  if (monthlySavingRate <= 0) {
    return null;
  }
  return Math.ceil(remaining / monthlySavingRate);
};

export const getPurchaseAdvice = (data: MoneyLensData, price: number) => {
  const currentExpenses = getTotalExpenses(getCurrentMonthExpenses(data.expenses));
  const subscriptionCost = getSubscriptionMonthlyCost(data);
  const currentBalance = data.monthlyBudget - currentExpenses - subscriptionCost;
  const remainingBalance = currentBalance - price;
  const savingsRate = getSavingsRate(data);
  const consumptionRatio = currentBalance > 0 ? (price / currentBalance) * 100 : 100;

  let riskLevel: "Low" | "Medium" | "High" = "Low";
  if (remainingBalance < 0 || consumptionRatio > 60) {
    riskLevel = "High";
  } else if (consumptionRatio > 35 || savingsRate < 0.1) {
    riskLevel = "Medium";
  }

  const affordabilityScore = Math.max(
    0,
    Math.min(100, Math.round(70 + savingsRate * 20 - Math.max(consumptionRatio - 25, 0) * 0.8)),
  );

  const monthlyRecovery = Math.max(data.monthlyBudget - currentExpenses - subscriptionCost, 0);
  const recoveryMonths = monthlyRecovery > 0 ? Math.ceil(price / monthlyRecovery) : null;

  let recommendation = "You can afford this purchase.";
  if (remainingBalance < 0) {
    recommendation = "Recommended: Wait until next month.";
  } else if (consumptionRatio > 35) {
    recommendation = "This purchase may affect your savings goal.";
  }

  return {
    currentBalance,
    remainingBalance,
    riskLevel,
    affordabilityScore,
    recommendation,
    consumptionRatio: Math.round(consumptionRatio),
    recoveryMonths,
  };
};
