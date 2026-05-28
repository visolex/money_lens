import { EMPTY_DATA, STORAGE_KEY } from "@/lib/constants";
import { getDefaultAllocations, withBudgetAmounts } from "@/lib/finance";
import type { BudgetAllocation, Expense, MoneyLensData, MonthlyReport, SavingsGoal } from "@/lib/types";

const cloneDefault = (): MoneyLensData => JSON.parse(JSON.stringify(EMPTY_DATA)) as MoneyLensData;

const normalizeData = (rawData: unknown): MoneyLensData => {
  const raw = (rawData as Partial<MoneyLensData> & { monthlyIncome?: number }) ?? {};
  const monthlyBudget = Number(raw.monthlyBudget ?? raw.monthlyIncome ?? 0);
  const allocations =
    raw.allocations && raw.allocations.length > 0
      ? withBudgetAmounts(monthlyBudget, raw.allocations as BudgetAllocation[])
      : getDefaultAllocations(monthlyBudget);

  return {
    monthlyBudget,
    hasOnboarded: Boolean(raw.hasOnboarded),
    smartDistributionEnabled: Boolean(raw.smartDistributionEnabled),
    allocations,
    expenses: Array.isArray(raw.expenses) ? raw.expenses : [],
    goals: Array.isArray(raw.goals) ? raw.goals : [],
    reports: Array.isArray(raw.reports) ? raw.reports : [],
  };
};

export const readData = (): MoneyLensData => {
  if (typeof window === "undefined") {
    return cloneDefault();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = cloneDefault();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const normalized = normalizeData(JSON.parse(raw));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    const seeded = cloneDefault();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
};

export const writeData = (data: MoneyLensData) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const setBudget = (budget: number, addToCurrent = false) => {
  const data = readData();
  data.monthlyBudget = addToCurrent ? data.monthlyBudget + budget : budget;
  data.hasOnboarded = true;
  data.allocations = withBudgetAmounts(data.monthlyBudget, data.allocations);
  writeData(data);
};

export const setSmartDistributionEnabled = (enabled: boolean) => {
  const data = readData();
  data.smartDistributionEnabled = enabled;
  if (enabled && data.allocations.length === 0) {
    data.allocations = getDefaultAllocations(data.monthlyBudget);
  }
  writeData(data);
};

export const updateAllocationPercentage = (category: BudgetAllocation["category"], percentage: number) => {
  const data = readData();
  data.allocations = data.allocations.map((allocation) =>
    allocation.category === category ? { ...allocation, percentage: Math.max(0, percentage) } : allocation,
  );
  const totalPercent = data.allocations.reduce((sum, item) => sum + item.percentage, 0) || 1;
  data.allocations = withBudgetAmounts(
    data.monthlyBudget,
    data.allocations.map((item) => ({ ...item, percentage: Math.round((item.percentage / totalPercent) * 100) })),
  );
  writeData(data);
};

export const addExpense = (expense: Omit<Expense, "id">) => {
  const data = readData();
  data.expenses.unshift({ ...expense, id: crypto.randomUUID() });
  writeData(data);
};

export const updateExpense = (id: string, expense: Omit<Expense, "id">) => {
  const data = readData();
  data.expenses = data.expenses.map((item) =>
    item.id === id ? { ...expense, id } : item,
  );
  writeData(data);
};

export const deleteExpense = (id: string) => {
  const data = readData();
  data.expenses = data.expenses.filter((expense) => expense.id !== id);
  writeData(data);
};

export const addGoal = (goal: Omit<SavingsGoal, "id">) => {
  const data = readData();
  data.goals.push({ ...goal, id: crypto.randomUUID() });
  writeData(data);
};

export const updateGoalAmount = (id: string, currentAmount: number) => {
  const data = readData();
  data.goals = data.goals.map((goal) =>
    goal.id === id ? { ...goal, currentAmount } : goal,
  );
  writeData(data);
};

export const addMonthlyReport = (report: Omit<MonthlyReport, "id" | "generatedAt">) => {
  const data = readData();
  data.reports.unshift({
    ...report,
    id: crypto.randomUUID(),
    generatedAt: new Date().toISOString(),
  });
  writeData(data);
};
