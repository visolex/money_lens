import { ALLOCATION_CATEGORIES, EMPTY_DATA, STORAGE_KEY, buildAllocations } from "@/lib/constants";
import type {
  BudgetAllocation,
  BudgetAllocationCategory,
  Expense,
  MonthlyReport,
  MoneyLensData,
  SavingsGoal,
  Subscription,
} from "@/lib/types";

const cloneEmpty = (): MoneyLensData => JSON.parse(JSON.stringify(EMPTY_DATA)) as MoneyLensData;

const safeNumber = (value: unknown, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const recalculateAllocations = (monthlyBudget: number, allocations: BudgetAllocation[]) => {
  if (!allocations.length) {
    return buildAllocations(monthlyBudget);
  }

  return ALLOCATION_CATEGORIES.map((category) => {
    const existing = allocations.find((item) => item.category === category);
    const percentage = safeNumber(existing?.percentage, 0);
    return {
      category,
      percentage,
      amount: Math.round((monthlyBudget * percentage) / 100),
    };
  });
};

const normalizeData = (raw: unknown): MoneyLensData => {
  const data = raw as Partial<MoneyLensData> & { monthlyIncome?: number };
  const monthlyBudget = Math.max(
    0,
    Math.round(safeNumber(data.monthlyBudget, safeNumber(data.monthlyIncome, 0))),
  );

  return {
    monthlyBudget,
    expenses: Array.isArray(data.expenses)
      ? data.expenses.map((expense) => ({
          id: String(expense.id ?? crypto.randomUUID()),
          amount: Math.max(0, safeNumber(expense.amount)),
          category: expense.category,
          description: String(expense.description ?? ""),
          date: String(expense.date ?? new Date().toISOString().slice(0, 10)),
        }))
      : [],
    goals: Array.isArray(data.goals)
      ? data.goals.map((goal) => ({
          id: String(goal.id ?? crypto.randomUUID()),
          name: String(goal.name ?? ""),
          targetAmount: Math.max(0, safeNumber(goal.targetAmount)),
          currentAmount: Math.max(0, safeNumber(goal.currentAmount)),
        }))
      : [],
    subscriptions: Array.isArray(data.subscriptions)
      ? data.subscriptions.map((subscription) => ({
          id: String(subscription.id ?? crypto.randomUUID()),
          name: String(subscription.name ?? ""),
          monthlyCost: Math.max(0, safeNumber(subscription.monthlyCost)),
        }))
      : [],
    smartBudgetEnabled: Boolean(data.smartBudgetEnabled),
    allocations: recalculateAllocations(monthlyBudget, Array.isArray(data.allocations) ? data.allocations : []),
    reports: Array.isArray(data.reports)
      ? data.reports.map((report) => ({
          id: String(report.id ?? crypto.randomUUID()),
          month: String(report.month ?? new Date().toISOString().slice(0, 7)),
          generatedAt: String(report.generatedAt ?? new Date().toISOString()),
          totalExpenses: Math.max(0, safeNumber(report.totalExpenses)),
          highestCategory: report.highestCategory ?? "None",
          savingsPercentage: Math.max(0, safeNumber(report.savingsPercentage)),
          budgetEfficiency: Math.max(0, safeNumber(report.budgetEfficiency)),
          financialScore: Math.max(0, safeNumber(report.financialScore)),
        }))
      : [],
  };
};

const updateData = (updater: (data: MoneyLensData) => MoneyLensData) => {
  const data = readData();
  const next = updater(data);
  writeData(next);
  return next;
};

export const readData = (): MoneyLensData => {
  if (typeof window === "undefined") {
    return cloneEmpty();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = cloneEmpty();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const normalized = normalizeData(JSON.parse(raw));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    const fallback = cloneEmpty();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }
};

export const writeData = (data: MoneyLensData) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeData(data)));
};

export const setMonthlyBudget = (monthlyBudget: number) => {
  updateData((data) => {
    const nextBudget = Math.max(0, Math.round(monthlyBudget));
    return {
      ...data,
      monthlyBudget: nextBudget,
      allocations: recalculateAllocations(nextBudget, data.allocations),
    };
  });
};

export const addToBudget = (amount: number) => {
  updateData((data) => {
    const nextBudget = Math.max(0, data.monthlyBudget + Math.round(Math.max(0, amount)));
    return {
      ...data,
      monthlyBudget: nextBudget,
      allocations: recalculateAllocations(nextBudget, data.allocations),
    };
  });
};

export const setSmartBudgetEnabled = (enabled: boolean) => {
  updateData((data) => ({ ...data, smartBudgetEnabled: enabled }));
};

export const updateAllocation = (category: BudgetAllocationCategory, percentage: number) => {
  updateData((data) => {
    const nextAllocations = data.allocations.map((allocation) =>
      allocation.category === category
        ? { ...allocation, percentage: Math.max(0, Math.min(100, Math.round(percentage))) }
        : allocation,
    );

    return {
      ...data,
      allocations: recalculateAllocations(data.monthlyBudget, nextAllocations),
    };
  });
};

export const addExpense = (expense: Omit<Expense, "id">) => {
  updateData((data) => ({
    ...data,
    expenses: [{ ...expense, id: crypto.randomUUID() }, ...data.expenses],
  }));
};

export const updateExpense = (id: string, expense: Omit<Expense, "id">) => {
  updateData((data) => ({
    ...data,
    expenses: data.expenses.map((item) => (item.id === id ? { ...expense, id } : item)),
  }));
};

export const deleteExpense = (id: string) => {
  updateData((data) => ({
    ...data,
    expenses: data.expenses.filter((expense) => expense.id !== id),
  }));
};

export const addGoal = (goal: Omit<SavingsGoal, "id">) => {
  updateData((data) => ({
    ...data,
    goals: [...data.goals, { ...goal, id: crypto.randomUUID() }],
  }));
};

export const updateGoalAmount = (id: string, currentAmount: number) => {
  updateData((data) => ({
    ...data,
    goals: data.goals.map((goal) => (goal.id === id ? { ...goal, currentAmount: Math.max(0, currentAmount) } : goal)),
  }));
};

export const updateGoal = (id: string, goal: Omit<SavingsGoal, "id">) => {
  updateData((data) => ({
    ...data,
    goals: data.goals.map((item) =>
      item.id === id
        ? {
            ...goal,
            id,
            targetAmount: Math.max(0, goal.targetAmount),
            currentAmount: Math.max(0, goal.currentAmount),
          }
        : item,
    ),
  }));
};

export const deleteGoal = (id: string) => {
  updateData((data) => ({
    ...data,
    goals: data.goals.filter((goal) => goal.id !== id),
  }));
};

export const addSubscription = (subscription: Omit<Subscription, "id">) => {
  updateData((data) => ({
    ...data,
    subscriptions: [...data.subscriptions, { ...subscription, id: crypto.randomUUID() }],
  }));
};

export const deleteSubscription = (id: string) => {
  updateData((data) => ({
    ...data,
    subscriptions: data.subscriptions.filter((subscription) => subscription.id !== id),
  }));
};

export const saveMonthlyReport = (report: Omit<MonthlyReport, "id" | "generatedAt">) => {
  updateData((data) => ({
    ...data,
    reports: [
      {
        ...report,
        id: crypto.randomUUID(),
        generatedAt: new Date().toISOString(),
      },
      ...data.reports,
    ].slice(0, 12),
  }));
};
