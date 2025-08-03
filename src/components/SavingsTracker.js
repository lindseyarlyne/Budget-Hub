import React, { memo, useMemo, useCallback, useState } from 'react';
import { useBudgetData, useChartData } from '../hooks';

const SavingsTracker = memo(() => {
  const { savingsData, loading, error } = useBudgetData();
  const [timeRange, setTimeRange] = useState('6months');
  const [goalAmount, setGoalAmount] = useState(savingsData?.goal || 5000);

  // Memoized savings calculations
  const savingsMetrics = useMemo(() => {
    if (!savingsData) return null;

    const totalSaved = savingsData.entries?.reduce((sum, entry) => sum + entry.amount, 0) || 0;
    const monthlyAverage = totalSaved / (savingsData.entries?.length || 1);
    const progressPercentage = (totalSaved / goalAmount) * 100;
    
    const monthsToGoal = goalAmount > totalSaved 
      ? Math.ceil((goalAmount - totalSaved) / monthlyAverage)
      : 0;

    return {
      totalSaved,
      monthlyAverage,
      progressPercentage: Math.min(progressPercentage, 100),
      monthsToGoal,
      isGoalMet: totalSaved >= goalAmount
    };
  }, [savingsData, goalAmount]);

  // Memoized chart data for performance
  const chartData = useChartData(savingsData?.entries, timeRange);

  // Trend analysis
  const savingsTrend = useMemo(() => {
    if (!savingsData?.entries || savingsData.entries.length < 2) return null;

    const recentEntries = savingsData.entries.slice(-3);
    const olderEntries = savingsData.entries.slice(-6, -3);

    const recentAverage = recentEntries.reduce((sum, entry) => sum + entry.amount, 0) / recentEntries.length;
    const olderAverage = olderEntries.reduce((sum, entry) => sum + entry.amount, 0) / (olderEntries.length || 1);

    const trendPercentage = ((recentAverage - olderAverage) / olderAverage) * 100;

    return {
      direction: trendPercentage > 5 ? 'up' : trendPercentage < -5 ? 'down' : 'stable',
      percentage: Math.abs(trendPercentage).toFixed(1)
    };
  }, [savingsData?.entries]);

  const handleTimeRangeChange = useCallback((range) => {
    setTimeRange(range);
  }, []);

  const handleGoalUpdate = useCallback((newGoal) => {
    setGoalAmount(Number(newGoal));
  }, []);

  if (loading) {
    return <div className="savings-loading">Loading savings data...</div>;
  }

  if (error) {
    return <div className="savings-error">Error loading savings: {error.message}</div>;
  }

  if (!savingsMetrics) {
    return <div className="savings-empty">No savings data available</div>;
  }

  return (
    <div className="savings-tracker">
      <div className="savings-header">
        <h2>Savings Tracker</h2>
        <div className="time-range-selector">
          <TimeRangeButton 
            range="3months" 
            label="3M" 
            active={timeRange === '3months'} 
            onClick={handleTimeRangeChange} 
          />
          <TimeRangeButton 
            range="6months" 
            label="6M" 
            active={timeRange === '6months'} 
            onClick={handleTimeRangeChange} 
          />
          <TimeRangeButton 
            range="1year" 
            label="1Y" 
            active={timeRange === '1year'} 
            onClick={handleTimeRangeChange} 
          />
          <TimeRangeButton 
            range="all" 
            label="All" 
            active={timeRange === 'all'} 
            onClick={handleTimeRangeChange} 
          />
        </div>
      </div>

      <div className="savings-overview">
        <SavingsCard 
          title="Total Saved" 
          value={`$${savingsMetrics.totalSaved.toLocaleString()}`}
          trend={savingsTrend}
          type="total"
        />
        <SavingsCard 
          title="Monthly Average" 
          value={`$${savingsMetrics.monthlyAverage.toLocaleString()}`}
          type="average"
        />
        <SavingsCard 
          title="Goal Progress" 
          value={`${savingsMetrics.progressPercentage.toFixed(1)}%`}
          type="progress"
          isGoalMet={savingsMetrics.isGoalMet}
        />
        <SavingsCard 
          title="Months to Goal" 
          value={savingsMetrics.isGoalMet ? "Goal Met!" : savingsMetrics.monthsToGoal.toString()}
          type="projection"
        />
      </div>

      <div className="savings-goal">
        <GoalTracker 
          current={savingsMetrics.totalSaved}
          goal={goalAmount}
          onGoalUpdate={handleGoalUpdate}
        />
      </div>

      <div className="savings-chart">
        <SavingsChart data={chartData} timeRange={timeRange} />
      </div>

      <div className="savings-insights">
        <SavingsInsights 
          metrics={savingsMetrics} 
          trend={savingsTrend}
          timeRange={timeRange}
        />
      </div>
    </div>
  );
});

// Memoized sub-components
const TimeRangeButton = memo(({ range, label, active, onClick }) => (
  <button
    className={`time-range-btn ${active ? 'active' : ''}`}
    onClick={() => onClick(range)}
  >
    {label}
  </button>
));

const SavingsCard = memo(({ title, value, trend, type, isGoalMet }) => (
  <div className={`savings-card savings-card--${type} ${isGoalMet ? 'goal-met' : ''}`}>
    <h4>{title}</h4>
    <div className="savings-value">{value}</div>
    {trend && (
      <div className={`trend trend--${trend.direction}`}>
        <span className="trend-icon">
          {trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '→'}
        </span>
        <span className="trend-text">
          {trend.direction === 'stable' ? 'Stable' : `${trend.percentage}%`}
        </span>
      </div>
    )}
  </div>
));

const GoalTracker = memo(({ current, goal, onGoalUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(goal);

  const handleSave = useCallback(() => {
    onGoalUpdate(editValue);
    setIsEditing(false);
  }, [editValue, onGoalUpdate]);

  const progressWidth = Math.min((current / goal) * 100, 100);

  return (
    <div className="goal-tracker">
      <div className="goal-header">
        <h3>Savings Goal</h3>
        {isEditing ? (
          <div className="goal-edit">
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(Number(e.target.value))}
              className="goal-input"
            />
            <button onClick={handleSave} className="btn btn-sm">Save</button>
            <button onClick={() => setIsEditing(false)} className="btn btn-sm btn-outline">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} className="btn btn-sm btn-outline">
            Edit Goal (${goal.toLocaleString()})
          </button>
        )}
      </div>
      <div className="goal-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progressWidth}%` }}
          ></div>
        </div>
        <div className="progress-labels">
          <span>$0</span>
          <span>${current.toLocaleString()} / ${goal.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
});

// Placeholder for chart component (would use a library like Chart.js or D3)
const SavingsChart = memo(({ data, timeRange }) => (
  <div className="savings-chart-container">
    <h3>Savings Over Time</h3>
    <div className="chart-placeholder">
      {/* Chart implementation would go here */}
      <p>Chart showing savings progression over {timeRange}</p>
      <p>Data points: {data?.length || 0}</p>
    </div>
  </div>
));

const SavingsInsights = memo(({ metrics, trend, timeRange }) => {
  const insights = useMemo(() => {
    const tips = [];
    
    if (metrics.monthlyAverage < 500) {
      tips.push("Consider setting up automatic transfers to boost your savings rate.");
    }
    
    if (trend?.direction === 'down') {
      tips.push("Your savings rate has decreased recently. Review your budget to identify areas to cut back.");
    }
    
    if (metrics.progressPercentage > 75) {
      tips.push("Great job! You're close to reaching your goal. Keep up the momentum!");
    }
    
    return tips;
  }, [metrics, trend]);

  return (
    <div className="savings-insights">
      <h3>Insights & Tips</h3>
      {insights.length > 0 ? (
        <ul className="insights-list">
          {insights.map((tip, index) => (
            <li key={index} className="insight-item">{tip}</li>
          ))}
        </ul>
      ) : (
        <p>Keep tracking your savings to get personalized insights!</p>
      )}
    </div>
  );
});

SavingsTracker.displayName = 'SavingsTracker';
TimeRangeButton.displayName = 'TimeRangeButton';
SavingsCard.displayName = 'SavingsCard';
GoalTracker.displayName = 'GoalTracker';
SavingsChart.displayName = 'SavingsChart';
SavingsInsights.displayName = 'SavingsInsights';

export default SavingsTracker;