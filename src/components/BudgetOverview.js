import React, { memo, useMemo, useCallback, useState, useEffect } from 'react';
import { useBudgetData } from '../hooks';

const BudgetOverview = memo(() => {
  const { budgetData, loading, error } = useBudgetData();
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  // Memoized calculations to prevent unnecessary recalculations
  const budgetSummary = useMemo(() => {
    if (!budgetData) return null;
    
    const totalIncome = budgetData.income?.reduce((sum, item) => sum + item.amount, 0) || 0;
    const totalExpenses = budgetData.expenses?.reduce((sum, item) => sum + item.amount, 0) || 0;
    const remaining = totalIncome - totalExpenses;
    
    return {
      totalIncome,
      totalExpenses,
      remaining,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0
    };
  }, [budgetData]);

  // Memoized category breakdown
  const categoryBreakdown = useMemo(() => {
    if (!budgetData?.expenses) return [];
    
    const categories = budgetData.expenses.reduce((acc, expense) => {
      const category = expense.category || 'Other';
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {});
    
    return Object.entries(categories)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [budgetData?.expenses]);

  const handlePeriodChange = useCallback((period) => {
    setSelectedPeriod(period);
  }, []);

  if (loading) {
    return <div className="budget-overview-loading">Loading budget data...</div>;
  }

  if (error) {
    return <div className="budget-overview-error">Error loading budget: {error.message}</div>;
  }

  if (!budgetSummary) {
    return <div className="budget-overview-empty">No budget data available</div>;
  }

  return (
    <div className="budget-overview">
      <div className="budget-header">
        <h2>Budget Overview</h2>
        <select 
          value={selectedPeriod} 
          onChange={(e) => handlePeriodChange(e.target.value)}
          className="period-selector"
        >
          <option value="current">Current Month</option>
          <option value="last">Last Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="budget-cards">
        <BudgetCard 
          title="Total Income" 
          amount={budgetSummary.totalIncome} 
          type="income"
        />
        <BudgetCard 
          title="Total Expenses" 
          amount={budgetSummary.totalExpenses} 
          type="expense"
        />
        <BudgetCard 
          title="Remaining" 
          amount={budgetSummary.remaining} 
          type={budgetSummary.remaining >= 0 ? 'positive' : 'negative'}
        />
        <BudgetCard 
          title="Savings Rate" 
          amount={`${budgetSummary.savingsRate}%`} 
          type="percentage"
        />
      </div>

      <div className="category-breakdown">
        <h3>Expenses by Category</h3>
        <div className="category-list">
          {categoryBreakdown.map(({ category, amount }) => (
            <CategoryItem 
              key={category} 
              category={category} 
              amount={amount}
              total={budgetSummary.totalExpenses}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

// Memoized sub-components to prevent unnecessary re-renders
const BudgetCard = memo(({ title, amount, type }) => (
  <div className={`budget-card budget-card--${type}`}>
    <h4>{title}</h4>
    <span className="amount">
      {typeof amount === 'string' ? amount : `$${amount.toLocaleString()}`}
    </span>
  </div>
));

const CategoryItem = memo(({ category, amount, total }) => {
  const percentage = ((amount / total) * 100).toFixed(1);
  
  return (
    <div className="category-item">
      <div className="category-info">
        <span className="category-name">{category}</span>
        <span className="category-amount">${amount.toLocaleString()}</span>
      </div>
      <div className="category-bar">
        <div 
          className="category-fill" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <span className="category-percentage">{percentage}%</span>
    </div>
  );
});

BudgetOverview.displayName = 'BudgetOverview';
BudgetCard.displayName = 'BudgetCard';
CategoryItem.displayName = 'CategoryItem';

export default BudgetOverview;