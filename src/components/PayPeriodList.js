import React from 'react';

const PayPeriodList = ({ entries, onDeleteEntry, colors }) => {
  return (
    <div className="p-4 rounded-lg" style={{ backgroundColor: colors.surface }}>
      <h2 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>
        Recent Entries
      </h2>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {entries.length === 0 ? (
          <p style={{ color: colors.textSecondary }}>No entries yet</p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="flex justify-between items-center p-3 rounded-lg"
              style={{ backgroundColor: colors.background }}
            >
              <div>
                <div className="font-medium" style={{ color: colors.text }}>
                  {entry.description}
                </div>
                <div className="text-sm" style={{ color: colors.textSecondary }}>
                  {entry.category} • {entry.type}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span
                  className="font-bold"
                  style={{ 
                    color: entry.type === 'income' ? colors.success : colors.error 
                  }}
                >
                  {entry.type === 'income' ? '+' : '-'}${entry.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => onDeleteEntry(entry.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PayPeriodList;
