"use client";

import { AppShell } from "@/components/app-shell";
import { currency } from "@/lib/finance";
import { addGoal, readData, updateGoalAmount } from "@/lib/storage";
import { useState } from "react";

export default function SavingsGoalsPage() {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [goals, setGoals] = useState(() => readData().goals);

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Savings Goals</h1>

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
            setGoals(readData().goals);
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

              return (
                <div key={goal.id} className="rounded-xl border border-[#222222] bg-[#111111] p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-medium">{goal.name}</h2>
                    <p className="text-sm text-[#A1A1AA]">{percentage}% complete</p>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#1C1C1C]">
                    <div className="h-full rounded-full bg-[#D4D4D8] transition-all" style={{ width: `${percentage}%` }} />
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-[#A1A1AA] md:grid-cols-3">
                    <p>Target: {currency.format(goal.targetAmount)}</p>
                    <p>Current: {currency.format(goal.currentAmount)}</p>
                    <p>Remaining: {currency.format(remaining)}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      defaultValue={goal.currentAmount}
                      className="w-40 rounded-md border border-[#222222] bg-[#0A0A0A] px-3 py-2 text-sm outline-none transition focus:border-[#D4D4D8]"
                      onBlur={(e) => {
                        updateGoalAmount(goal.id, Number(e.target.value));
                        setGoals(readData().goals);
                      }}
                    />
                    <span className="text-xs text-[#A1A1AA]">Update current amount</span>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </AppShell>
  );
}
