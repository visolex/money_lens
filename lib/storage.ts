import { SAMPLE_DATA, STORAGE_KEY } from "@/lib/constants";
import type { Expense, MoneyLensData, SavingsGoal } from "@/lib/types";

const cloneSample = (): MoneyLensData =>
  JSON.parse(JSON.stringify(SAMPLE_DATA)) as MoneyLensData;

export const readData = (): MoneyLensData => {
  if (typeof window === "undefined") {
    return cloneSample();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = cloneSample();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    return JSON.parse(raw) as MoneyLensData;
  } catch {
    const seeded = cloneSample();
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
