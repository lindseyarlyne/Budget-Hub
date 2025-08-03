import React, { memo, useMemo, useCallback, useState } from 'react';
import { useVirtualizer, useBudgetData } from '../hooks';

const PayPeriodList = memo(() => {
  const { payPeriods, loading, error } = useBudgetData();
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Memoized sorted periods to prevent unnecessary sorting
  const sortedPeriods = useMemo(() => {
    if (!payPeriods) return [];
    
    return [...payPeriods].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });
  }, [payPeriods, sortBy, sortOrder]);

  // Virtual scrolling for performance with large lists
  const {
    containerRef,
    itemRefs,
    visibleItems,
    scrollToIndex
  } = useVirtualizer({
    items: sortedPeriods,
    itemHeight: 80,
    containerHeight: 600
  });

  const handleSort = useCallback((field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  }, [sortBy]);

  const scrollToCurrentPeriod = useCallback(() => {
    const currentIndex = sortedPeriods.findIndex(period => period.isCurrent);
    if (currentIndex >= 0) {
      scrollToIndex(currentIndex);
    }
  }, [sortedPeriods, scrollToIndex]);

  if (loading) {
    return <div className="pay-period-loading">Loading pay periods...</div>;
  }

  if (error) {
    return <div className="pay-period-error">Error loading pay periods: {error.message}</div>;
  }

  return (
    <div className="pay-period-list">
      <div className="pay-period-header">
        <h2>Pay Periods</h2>
        <div className="pay-period-controls">
          <button 
            onClick={scrollToCurrentPeriod}
            className="btn btn-secondary"
          >
            Jump to Current
          </button>
        </div>
      </div>

      <div className="pay-period-table">
        <div className="table-header">
          <SortableHeader 
            field="date" 
            label="Date" 
            sortBy={sortBy} 
            sortOrder={sortOrder} 
            onSort={handleSort} 
          />
          <SortableHeader 
            field="income" 
            label="Income" 
            sortBy={sortBy} 
            sortOrder={sortOrder} 
            onSort={handleSort} 
          />
          <SortableHeader 
            field="expenses" 
            label="Expenses" 
            sortBy={sortBy} 
            sortOrder={sortOrder} 
            onSort={handleSort} 
          />
          <SortableHeader 
            field="remaining" 
            label="Remaining" 
            sortBy={sortBy} 
            sortOrder={sortOrder} 
            onSort={handleSort} 
          />
          <div className="table-header-cell">Actions</div>
        </div>

        <div 
          ref={containerRef}
          className="table-body"
          style={{ height: '600px', overflow: 'auto' }}
        >
          {visibleItems.map(({ item: period, index }) => (
            <PayPeriodRow 
              key={period.id}
              ref={el => itemRefs.current[index] = el}
              period={period}
              index={index}
            />
          ))}
        </div>
      </div>

      {sortedPeriods.length === 0 && (
        <div className="pay-period-empty">
          No pay periods found. Add some budget entries to see them here.
        </div>
      )}
    </div>
  );
});

// Memoized sortable header component
const SortableHeader = memo(({ field, label, sortBy, sortOrder, onSort }) => (
  <button 
    className={`table-header-cell sortable ${sortBy === field ? 'active' : ''}`}
    onClick={() => onSort(field)}
  >
    {label}
    {sortBy === field && (
      <span className={`sort-icon ${sortOrder}`}>
        {sortOrder === 'asc' ? '↑' : '↓'}
      </span>
    )}
  </button>
));

// Memoized row component for optimal rendering
const PayPeriodRow = memo(React.forwardRef(({ period, index }, ref) => {
  const handleViewDetails = useCallback(() => {
    // Navigate to detailed view
    console.log('View details for period:', period.id);
  }, [period.id]);

  const handleEdit = useCallback(() => {
    // Open edit modal
    console.log('Edit period:', period.id);
  }, [period.id]);

  return (
    <div 
      ref={ref}
      className={`table-row ${period.isCurrent ? 'current' : ''} ${index % 2 === 0 ? 'even' : 'odd'}`}
    >
      <div className="table-cell">
        <div className="period-date">
          {new Date(period.startDate).toLocaleDateString()} - 
          {new Date(period.endDate).toLocaleDateString()}
        </div>
        {period.isCurrent && <span className="current-badge">Current</span>}
      </div>
      <div className="table-cell income">
        ${period.totalIncome.toLocaleString()}
      </div>
      <div className="table-cell expense">
        ${period.totalExpenses.toLocaleString()}
      </div>
      <div className={`table-cell remaining ${period.remaining >= 0 ? 'positive' : 'negative'}`}>
        ${period.remaining.toLocaleString()}
      </div>
      <div className="table-cell actions">
        <button 
          onClick={handleViewDetails}
          className="btn btn-sm btn-outline"
        >
          View
        </button>
        <button 
          onClick={handleEdit}
          className="btn btn-sm btn-outline"
        >
          Edit
        </button>
      </div>
    </div>
  );
}));

PayPeriodList.displayName = 'PayPeriodList';
SortableHeader.displayName = 'SortableHeader';
PayPeriodRow.displayName = 'PayPeriodRow';

export default PayPeriodList;