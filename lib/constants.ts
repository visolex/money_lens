import type { ExpenseCategory, MoneyLensData } from "@/lib/types";

export const CATEGORIES: ExpenseCategory[] = [
  "Food",
  "Travel",
  "Education",
  "Shopping",
  "Entertainment",
  "Subscriptions",
  "Other",
];

export const STORAGE_KEY = "moneylens_data_v1";

export const SAMPLE_DATA: MoneyLensData = {
  monthlyIncome: 2400,
  expenses: [
    { id: "e1", amount: 180, category: "Food", description: "Groceries", date: "2026-05-04" },
    { id: "e2", amount: 72, category: "Travel", description: "Metro card", date: "2026-05-07" },
    { id: "e3", amount: 145, category: "Education", description: "Course material", date: "2026-05-10" },
    { id: "e4", amount: 96, category: "Subscriptions", description: "Apps & tools", date: "2026-05-12" },
    { id: "e5", amount: 125, category: "Entertainment", description: "Movie & games", date: "2026-05-15" },
    { id: "e6", amount: 230, category: "Food", description: "Dining out", date: "2026-04-20" },
    { id: "e7", amount: 90, category: "Shopping", description: "Campus essentials", date: "2026-04-11" },
    { id: "e8", amount: 110, category: "Travel", description: "Weekend trip", date: "2026-03-16" },
    { id: "e9", amount: 160, category: "Education", description: "Exam prep", date: "2026-03-08" },
  ],
  goals: [
    { id: "g1", name: "Emergency Fund", targetAmount: 1500, currentAmount: 520 },
    { id: "g2", name: "New Laptop", targetAmount: 1800, currentAmount: 700 },
  ],
};
