import React, { useState } from 'react';

const SavingsTracker = ({ colors, remaining }) => {
  const [savingsGoal, setSavingsGoal] = useState(1000);
  const [showGoalForm, setShowGoalForm] = useState(false);

  const progress = savingsGoal > 0 ? Math.min((remaining / savingsGoal) * 100, 100) : 0;

  return (
    <div className="p-4 rounded-lg" style={{ backgroundColor: colors.surface }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold" style={{ color: colors.text }}>
          Savings Goal
        </h2>
        <button
          onClick={() => setShowGoalForm(!showGoalForm)}
          className="text-sm px-3 py-1 rounded"
          style={{ backgroundColor: colors.primary, color: 'white' }}
        >
          Set Goal
        </button>
      </div>

      {showGoalForm && (
        <div className="mb-4">
          <input
            type="number"
            placeholder="Enter savings goal"
            value={savingsGoal}
            onChange={(e) => setSavingsGoal(parseFloat(e.target.value) || 0)}
            className="w-full p-2 rounded border"
            style={{ 
              backgroundColor: colors.background, 
              borderColor: colors.textSecondary,
              color: colors.text 
            }}
          />
        </div>
      )}

      <div className="space-y-3">
        <div className="flex justify-between">
          <span style={{ color: colors.textSecondary }}>Progress</span>
          <span style={{ color: colors.text }}>{progress.toFixed(1)}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="h-3 rounded-full transition-all duration-300"
            style={{ 
              width: `${progress}%`,
              backgroundColor: colors.success
            }}
          />
        </div>
        
        <div className="flex justify-between text-sm">
          <span style={{ color: colors.textSecondary }}>
            Current: ${remaining.toFixed(2)}
          </span>
          <span style={{ color: colors.textSecondary }}>
            Goal: ${savingsGoal.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SavingsTracker;
