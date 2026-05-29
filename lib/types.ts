export type ExpenseCategory =
  | "Food"
  | "Travel"
  | "Education"
  | "Shopping"
  | "Entertainment"
  | "Subscriptions"
  | "Other";

export type BudgetAllocationCategory =
  | "Needs"
  | "Savings"
  | "Education"
  | "Entertainment"
  | "Emergency";

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

export type Subscription = {
  id: string;
  name: string;
  monthlyCost: number;
};

export type BudgetAllocation = {
  category: BudgetAllocationCategory;
  percentage: number;
  amount: number;
};

export type MonthlyReport = {
  id: string;
  month: string;
  generatedAt: string;
  totalExpenses: number;
  highestCategory: ExpenseCategory | "None";
  savingsPercentage: number;
  budgetEfficiency: number;
  financialScore: number;
};

export type MoneyLensData = {
  monthlyBudget: number;
  expenses: Expense[];
  goals: SavingsGoal[];
  subscriptions: Subscription[];
  smartBudgetEnabled: boolean;
  allocations: BudgetAllocation[];
  reports: MonthlyReport[];
};
