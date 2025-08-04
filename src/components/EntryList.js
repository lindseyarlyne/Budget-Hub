import React, { memo, useState, useCallback, useMemo } from 'react';
import { useBudgetData, useBudgetActions } from '../hooks';

const EntryList = memo(() => {
  const { budgetData, loading, error } = useBudgetData();
  const { updateBudgetEntry, deleteBudgetEntry, loading: actionLoading } = useBudgetActions();
  const [editingEntry, setEditingEntry] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'income', 'expense'

  // Combine and sort all entries
  const allEntries = useMemo(() => {
    if (!budgetData) return [];
    
    const incomeEntries = (budgetData.income || []).map(entry => ({
      ...entry,
      type: 'income'
    }));
    
    const expenseEntries = (budgetData.expenses || []).map(entry => ({
      ...entry,
      type: 'expense'
    }));
    
    const combined = [...incomeEntries, ...expenseEntries];
    
    // Filter by type
    const filtered = filter === 'all' ? combined : combined.filter(entry => entry.type === filter);
    
    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [budgetData, filter]);

  const handleEdit = useCallback((entry) => {
    setEditingEntry({
      ...entry,
      originalId: entry.id,
      originalType: entry.type
    });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingEntry(null);
  }, []);

  const handleSaveEdit = useCallback(async (updatedEntry) => {
    try {
      await updateBudgetEntry(updatedEntry.originalId, {
        amount: parseFloat(updatedEntry.amount),
        category: updatedEntry.category,
        description: updatedEntry.description,
        date: updatedEntry.date
      });
      setEditingEntry(null);
      // Data will refresh automatically due to cache invalidation
    } catch (error) {
      console.error('Failed to update entry:', error);
    }
  }, [updateBudgetEntry]);

  const handleDelete = useCallback(async (entryId, entryType) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteBudgetEntry(entryId);
        // Data will refresh automatically due to cache invalidation
      } catch (error) {
        console.error('Failed to delete entry:', error);
      }
    }
  }, [deleteBudgetEntry]);

  if (loading) {
    return (
      <div className="entry-list">
        <h2>Budget Entries</h2>
        <div className="loading-text">Loading entries...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="entry-list">
        <h2>Budget Entries</h2>
        <div className="error-text">Error loading entries: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="entry-list">
      <div className="list-header">
        <h2>Budget Entries</h2>
        
        <div className="filter-controls">
          <label>Filter by type:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Entries</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
          </select>
        </div>
      </div>

      {allEntries.length === 0 ? (
        <div className="empty-state">
          <p>No entries found.</p>
          <p>Start by adding your first budget entry!</p>
        </div>
      ) : (
        <div className="entries-grid">
          {allEntries.map((entry) => (
            <EntryCard
              key={`${entry.type}-${entry.id}`}
              entry={entry}
              isEditing={editingEntry?.originalId === entry.id && editingEntry?.originalType === entry.type}
              editingData={editingEntry}
              onEdit={handleEdit}
              onCancelEdit={handleCancelEdit}
              onSaveEdit={handleSaveEdit}
              onDelete={handleDelete}
              isLoading={actionLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
});

const EntryCard = memo(({ 
  entry, 
  isEditing, 
  editingData, 
  onEdit, 
  onCancelEdit, 
  onSaveEdit, 
  onDelete, 
  isLoading 
}) => {
  const [localData, setLocalData] = useState(editingData || entry);

  // Update local data when editing changes
  React.useEffect(() => {
    if (isEditing && editingData) {
      setLocalData(editingData);
    } else {
      setLocalData(entry);
    }
  }, [isEditing, editingData, entry]);

  const handleInputChange = useCallback((field, value) => {
    setLocalData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSave = useCallback(() => {
    onSaveEdit(localData);
  }, [localData, onSaveEdit]);

  const categoryOptions = useMemo(() => {
    const expenseCategories = [
      'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
      'Bills & Utilities', 'Healthcare', 'Travel', 'Housing', 'Other'
    ];
    
    const incomeCategories = [
      'Salary', 'Freelance', 'Investment', 'Business', 'Other'
    ];
    
    return entry.type === 'expense' ? expenseCategories : incomeCategories;
  }, [entry.type]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`entry-card entry-card--${entry.type}`}>
      <div className="entry-header">
        <span className={`entry-type-badge entry-type-badge--${entry.type}`}>
          {entry.type === 'income' ? '💰' : '💸'} {entry.type}
        </span>
        <span className="entry-date">{formatDate(entry.date)}</span>
      </div>

      {isEditing ? (
        <div className="entry-edit-form">
          <div className="form-group">
            <label>Amount:</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={localData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Category:</label>
            <select
              value={localData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="form-control"
            >
              {categoryOptions.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description:</label>
            <input
              type="text"
              value={localData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="form-control"
              placeholder="Enter description"
            />
          </div>

          <div className="form-group">
            <label>Date:</label>
            <input
              type="date"
              value={localData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="form-control"
            />
          </div>

          <div className="entry-actions">
            <button 
              onClick={handleSave}
              disabled={isLoading}
              className="btn btn-save"
            >
              {isLoading ? 'Saving...' : '✅ Save'}
            </button>
            <button 
              onClick={onCancelEdit}
              disabled={isLoading}
              className="btn btn-cancel"
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="entry-content">
          <div className="entry-amount">
            ${entry.amount.toLocaleString()}
          </div>
          
          <div className="label-row">
            <span>Category:</span>
            <span>{entry.category}</span>
          </div>
          
          {entry.description && (
            <div className="label-row">
              <span>Description:</span>
              <span>{entry.description}</span>
            </div>
          )}

          <div className="entry-actions">
            <button 
              onClick={() => onEdit(entry)}
              disabled={isLoading}
              className="btn btn-edit"
            >
              ✏️ Edit
            </button>
            <button 
              onClick={() => onDelete(entry.id, entry.type)}
              disabled={isLoading}
              className="btn btn-delete"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

EntryList.displayName = 'EntryList';
EntryCard.displayName = 'EntryCard';

export default EntryList;