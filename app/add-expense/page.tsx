"use client";

import { AppShell } from "@/components/app-shell";
import { CATEGORIES } from "@/lib/constants";
import { currency, getCurrentMonthExpenses, getTotalExpenses } from "@/lib/finance";
import { addExpense, deleteExpense, readData, updateExpense } from "@/lib/storage";
import type { ExpenseCategory } from "@/lib/types";
import { useMemo, useState } from "react";

const emptyForm = {
  amount: "",
  category: CATEGORIES[0],
  description: "",
  date: new Date().toISOString().slice(0, 10),
};

export default function AddExpensePage() {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [data, setData] = useState(() => readData());

  const expenses = useMemo(
    () =>
      data.expenses
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date)),
    [data.expenses],
  );

  const currentMonthSpend = getTotalExpenses(getCurrentMonthExpenses(data.expenses));

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const refresh = () => setData(readData());

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      amount: Number(form.amount),
      category: form.category,
      description: form.description.trim(),
      date: form.date,
    };

    if (!payload.amount || !payload.description || !payload.date) {
      return;
    }

    if (editingId) {
      updateExpense(editingId, payload);
    } else {
      addExpense(payload);
    }

    reset();
    refresh();
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Add Expense</h1>

        <div className="rounded-xl border border-[#222222] bg-[#111111] p-4 text-sm text-[#A1A1AA]">
          This month spend: <span className="text-[#FAFAFA]">{currency.format(currentMonthSpend)}</span>
        </div>

        <form onSubmit={submit} className="grid gap-4 rounded-xl border border-[#222222] bg-[#111111] p-6 md:grid-cols-2">
          <label className="space-y-1 text-sm text-[#A1A1AA]">
            Amount (₹)
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
              className="w-full rounded-md border border-[#222222] bg-[#0A0A0A] px-3 py-2 text-[#FAFAFA] outline-none transition focus:border-[#D4D4D8]"
            />
          </label>

          <label className="space-y-1 text-sm text-[#A1A1AA]">
            Category
            <select
              value={form.category}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, category: e.target.value as ExpenseCategory }))
              }
              className="w-full rounded-md border border-[#222222] bg-[#0A0A0A] px-3 py-2 text-[#FAFAFA] outline-none transition focus:border-[#D4D4D8]"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm text-[#A1A1AA] md:col-span-2">
            Description
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-md border border-[#222222] bg-[#0A0A0A] px-3 py-2 text-[#FAFAFA] outline-none transition focus:border-[#D4D4D8]"
            />
          </label>

          <label className="space-y-1 text-sm text-[#A1A1AA]">
            Date
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              className="w-full rounded-md border border-[#222222] bg-[#0A0A0A] px-3 py-2 text-[#FAFAFA] outline-none transition focus:border-[#D4D4D8]"
            />
          </label>

          <div className="flex items-end gap-3">
            <button
              type="submit"
              className="rounded-md bg-[#FAFAFA] px-4 py-2 text-sm font-medium text-[#111111] transition hover:opacity-90"
            >
              {editingId ? "Save Expense" : "Add Expense"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={reset}
                className="rounded-md border border-[#222222] px-4 py-2 text-sm text-[#D4D4D8]"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <section className="rounded-xl border border-[#222222] bg-[#111111] p-6">
          <h2 className="text-lg font-semibold">Recent Expenses</h2>
          {expenses.length === 0 ? (
            <p className="mt-3 text-sm text-[#A1A1AA]">No expenses added yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {expenses.map((expense) => (
                <li key={expense.id} className="flex flex-col gap-3 rounded-md bg-[#151515] p-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium">{expense.description}</p>
                    <p className="text-xs text-[#A1A1AA]">
                      {expense.category} • {expense.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{currency.format(expense.amount)}</span>
                    <button
                      onClick={() => {
                        setEditingId(expense.id);
                        setForm({
                          amount: String(expense.amount),
                          category: expense.category,
                          description: expense.description,
                          date: expense.date,
                        });
                      }}
                      className="rounded-md border border-[#222222] px-3 py-1 text-xs text-[#D4D4D8]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        deleteExpense(expense.id);
                        if (editingId === expense.id) {
                          reset();
                        }
                        refresh();
                      }}
                      className="rounded-md border border-[#222222] px-3 py-1 text-xs text-[#D4D4D8]"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
