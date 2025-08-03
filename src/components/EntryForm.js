import React, { memo, useState, useCallback, useMemo } from 'react';
import { useFormValidation, useBudgetActions } from '../hooks';

const EntryForm = memo(() => {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const { addBudgetEntry, loading } = useBudgetActions();
  
  // Form validation with memoized rules
  const validationRules = useMemo(() => ({
    amount: {
      required: true,
      min: 0.01,
      message: 'Amount must be greater than 0'
    },
    category: {
      required: true,
      message: 'Category is required'
    },
    description: {
      required: true,
      minLength: 3,
      message: 'Description must be at least 3 characters'
    }
  }), []);

  const { errors, validate, isValid } = useFormValidation(formData, validationRules);

  // Memoized category options to prevent re-creation
  const categoryOptions = useMemo(() => {
    const expenseCategories = [
      'Food & Dining',
      'Transportation',
      'Shopping',
      'Entertainment',
      'Bills & Utilities',
      'Healthcare',
      'Travel',
      'Other'
    ];
    
    const incomeCategories = [
      'Salary',
      'Freelance',
      'Investment',
      'Business',
      'Other'
    ];
    
    return formData.type === 'expense' ? expenseCategories : incomeCategories;
  }, [formData.type]);

  // Optimized input handlers using useCallback
  const handleInputChange = useCallback((field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'amount' ? (value === '' ? '' : parseFloat(value) || 0) : value
    }));
  }, []);

  const handleTypeChange = useCallback((event) => {
    setFormData(prev => ({
      ...prev,
      type: event.target.value,
      category: '' // Reset category when type changes
    }));
  }, []);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      await addBudgetEntry(formData);
      // Reset form on success
      setFormData({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Failed to add entry:', error);
    }
  }, [formData, validate, addBudgetEntry]);

  return (
    <div className="entry-form">
      <h2>Add Budget Entry</h2>
      
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select
              id="type"
              value={formData.type}
              onChange={handleTypeChange}
              className="form-control"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={handleInputChange('amount')}
              className={`form-control ${errors.amount ? 'error' : ''}`}
              placeholder="0.00"
              aria-describedby={errors.amount ? 'amount-error' : undefined}
            />
            {errors.amount && (
              <span id="amount-error" className="error-message" role="alert">
                {errors.amount}
              </span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={formData.category}
              onChange={handleInputChange('category')}
              className={`form-control ${errors.category ? 'error' : ''}`}
              aria-describedby={errors.category ? 'category-error' : undefined}
            >
              <option value="">Select a category</option>
              {categoryOptions.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <span id="category-error" className="error-message" role="alert">
                {errors.category}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange('date')}
              className="form-control"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input
            id="description"
            type="text"
            value={formData.description}
            onChange={handleInputChange('description')}
            className={`form-control ${errors.description ? 'error' : ''}`}
            placeholder="Enter a description"
            aria-describedby={errors.description ? 'description-error' : undefined}
          />
          {errors.description && (
            <span id="description-error" className="error-message" role="alert">
              {errors.description}
            </span>
          )}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={!isValid || loading}
            className="btn btn-primary"
          >
            {loading ? 'Adding...' : `Add ${formData.type}`}
          </button>
        </div>
      </form>
    </div>
  );
});

EntryForm.displayName = 'EntryForm';

export default EntryForm;