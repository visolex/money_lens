import type { BudgetAllocation, BudgetAllocationCategory, ExpenseCategory, MoneyLensData } from "@/lib/types";

export const CATEGORIES: ExpenseCategory[] = [
  "Food",
  "Travel",
  "Education",
  "Shopping",
  "Entertainment",
  "Subscriptions",
  "Other",
];

export const ALLOCATION_CATEGORIES: BudgetAllocationCategory[] = [
  "Needs",
  "Savings",
  "Education",
  "Entertainment",
  "Emergency",
];

export const STORAGE_KEY = "moneylens_data_v2";

const DEFAULT_PERCENTAGES: Record<BudgetAllocationCategory, number> = {
  Needs: 50,
  Savings: 20,
  Education: 15,
  Entertainment: 10,
  Emergency: 5,
};

export const buildAllocations = (monthlyBudget: number): BudgetAllocation[] =>
  ALLOCATION_CATEGORIES.map((category) => {
    const percentage = DEFAULT_PERCENTAGES[category];
    return {
      category,
      percentage,
      amount: Math.round((monthlyBudget * percentage) / 100),
    };
  });

export const EMPTY_DATA: MoneyLensData = {
  monthlyBudget: 0,
  expenses: [],
  goals: [],
  subscriptions: [],
  smartBudgetEnabled: false,
  allocations: buildAllocations(0),
  reports: [],
};
