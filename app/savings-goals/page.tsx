"use client";

import { Pencil, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { currency, getGoalCompletionMonths, getSavingsRate } from "@/lib/finance";
import { addGoal, deleteGoal, readData, updateGoal } from "@/lib/storage";
import { useMemo, useState } from "react";

export default function SavingsGoalsPage() {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [data, setData] = useState(() => readData());
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [deleteGoalId, setDeleteGoalId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editTarget, setEditTarget] = useState("");
  const [editCurrent, setEditCurrent] = useState("");

  const goals = data.goals;
  const monthlySavingsAmount = useMemo(
    () => Math.round(data.monthlyBudget * getSavingsRate(data)),
    [data],
  );

  const refresh = () => setData(readData());

  return (
    <AppShell>
      {editingGoalId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#2A2A2A] bg-[#111111] p-6">
            <h2 className="text-xl font-semibold">Edit Goal</h2>
            <div className="mt-4 space-y-3">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Goal name"
                className="w-full rounded-md border border-[#222222] bg-[#0A0A0A] px-3 py-2 text-sm"
              />
              <input
                type="number"
                min="0"
                value={editTarget}
                onChange={(e) => setEditTarget(e.target.value)}
                placeholder="Target amount"
                className="w-full rounded-md border border-[#222222] bg-[#0A0A0A] px-3 py-2 text-sm"
              />
              <input
                type="number"
                min="0"
                value={editCurrent}
                onChange={(e) => setEditCurrent(e.target.value)}
                placeholder="Current progress"
                className="w-full rounded-md border border-[#222222] bg-[#0A0A0A] px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setEditingGoalId(null)}
                className="rounded-md border border-[#2A2A2A] px-4 py-2 text-sm text-[#D4D4D8] transition hover:bg-[#1A1A1A]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!editingGoalId || !editName.trim()) return;
                  updateGoal(editingGoalId, {
                    name: editName.trim(),
                    targetAmount: Number(editTarget),
                    currentAmount: Number(editCurrent),
                  });
                  setEditingGoalId(null);
                  refresh();
                }}
                className="rounded-md bg-[#FAFAFA] px-4 py-2 text-sm font-medium text-[#111111] transition hover:opacity-90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteGoalId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#2A2A2A] bg-[#111111] p-6">
            <h2 className="text-xl font-semibold">Delete Goal?</h2>
            <p className="mt-2 text-sm text-[#A1A1AA]">This action cannot be undone.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDeleteGoalId(null)}
                className="rounded-md border border-[#2A2A2A] px-4 py-2 text-sm text-[#D4D4D8] transition hover:bg-[#1A1A1A]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!deleteGoalId) return;
                  deleteGoal(deleteGoalId);
                  setDeleteGoalId(null);
                  refresh();
                }}
                className="rounded-md bg-[#D4D4D8] px-4 py-2 text-sm font-medium text-[#111111] transition hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Savings Goals</h1>

        <p className="rounded-xl border border-[#222222] bg-[#111111] p-4 text-sm text-[#A1A1AA]">
          At your current saving rate, you are saving around {currency.format(monthlySavingsAmount)} per month.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const target = Number(targetAmount);
            if (!name.trim() || !target) {
              return;
            }
            addGoal({ name: name.trim(), targetAmount: target, currentAmount: 0 });
            setName("");
            setTargetAmount("");
            refresh();
          }}
          className="grid gap-4 rounded-xl border border-[#222222] bg-[#111111] p-6 md:grid-cols-3"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Goal name"
            className="rounded-md border border-[#222222] bg-[#0A0A0A] px-3 py-2 text-sm outline-none transition focus:border-[#D4D4D8]"
          />
          <input
            type="number"
            min="0"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="Target amount"
            className="rounded-md border border-[#222222] bg-[#0A0A0A] px-3 py-2 text-sm outline-none transition focus:border-[#D4D4D8]"
          />
          <button
            type="submit"
            className="rounded-md bg-[#FAFAFA] px-4 py-2 text-sm font-medium text-[#111111] transition hover:opacity-90"
          >
            Create Goal
          </button>
        </form>

        {goals.length === 0 ? (
          <section className="rounded-xl border border-[#222222] bg-[#111111] p-6 text-sm text-[#A1A1AA]">
            No goals yet. Add your first savings goal above.
          </section>
        ) : (
          <section className="space-y-4">
            {goals.map((goal) => {
              const percentage = goal.targetAmount
                ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
                : 0;
              const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
              const months = getGoalCompletionMonths(goal, monthlySavingsAmount);

              return (
                <div key={goal.id} className="rounded-xl border border-[#222222] bg-[#111111] p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-medium">{goal.name}</h2>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-[#A1A1AA]">{percentage}% complete</p>
                      <button
                        onClick={() => {
                          setEditingGoalId(goal.id);
                          setEditName(goal.name);
                          setEditTarget(String(goal.targetAmount));
                          setEditCurrent(String(goal.currentAmount));
                        }}
                        className="rounded-md border border-[#2A2A2A] p-2 text-[#D4D4D8] transition hover:bg-[#1A1A1A]"
                        aria-label={`Edit ${goal.name}`}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteGoalId(goal.id)}
                        className="rounded-md border border-[#2A2A2A] p-2 text-[#D4D4D8] transition hover:bg-[#1A1A1A]"
                        aria-label={`Delete ${goal.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#1C1C1C]">
                    <div className="h-full rounded-full bg-[#D4D4D8] transition-all" style={{ width: `${percentage}%` }} />
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-[#A1A1AA] md:grid-cols-3">
                    <p>Target: {currency.format(goal.targetAmount)}</p>
                    <p>Current: {currency.format(goal.currentAmount)}</p>
                    <p>Remaining: {currency.format(remaining)}</p>
                  </div>
                  <p className="mt-3 text-sm text-[#D4D4D8]">
                    {months === null
                      ? "Estimated completion time: Add more monthly savings to predict timeline."
                      : months === 0
                        ? "Goal completed."
                        : `Estimated completion time: ${months} month${months > 1 ? "s" : ""}.`}
                  </p>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </AppShell>
  );
}
