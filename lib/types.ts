export type ExpenseCategory =
  | "Food"
  | "Travel"
  | "Education"
  | "Shopping"
  | "Entertainment"
  | "Subscriptions"
  | "Other";

export type Expense = {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
};

export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
};

export type AllocationCategory = "Needs" | "Savings" | "Education" | "Entertainment" | "Emergency";

export type BudgetAllocation = {
  category: AllocationCategory;
  percentage: number;
  amount: number;
};

export type MonthlyReport = {
  id: string;
  generatedAt: string;
  month: string;
  totalExpenses: number;
  highestCategory: ExpenseCategory | "None";
  savingsPercentage: number;
  budgetEfficiency: number;
  financialScore: number;
};

export type MoneyLensData = {
  monthlyBudget: number;
  hasOnboarded: boolean;
  smartDistributionEnabled: boolean;
  allocations: BudgetAllocation[];
  expenses: Expense[];
  goals: SavingsGoal[];
  reports: MonthlyReport[];
};
