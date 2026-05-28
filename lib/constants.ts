import type { BudgetAllocation, ExpenseCategory, MoneyLensData } from "@/lib/types";

export const CATEGORIES: ExpenseCategory[] = [
  "Food",
  "Travel",
  "Education",
  "Shopping",
  "Entertainment",
  "Subscriptions",
  "Other",
];

export const STORAGE_KEY = "moneylens_data_v2";

export const DEFAULT_ALLOCATION_TEMPLATE: BudgetAllocation[] = [
  { category: "Needs", percentage: 50, amount: 0 },
  { category: "Savings", percentage: 20, amount: 0 },
  { category: "Education", percentage: 15, amount: 0 },
  { category: "Entertainment", percentage: 10, amount: 0 },
  { category: "Emergency", percentage: 5, amount: 0 },
];

export const EMPTY_DATA: MoneyLensData = {
  monthlyBudget: 0,
  hasOnboarded: false,
  smartDistributionEnabled: false,
  allocations: DEFAULT_ALLOCATION_TEMPLATE,
  expenses: [],
  goals: [],
  reports: [],
};
