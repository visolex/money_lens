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

export type MoneyLensData = {
  monthlyIncome: number;
  expenses: Expense[];
  goals: SavingsGoal[];
};
