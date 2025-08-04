import React, { useState } from 'react';

const EntryForm = ({ onAddEntry, colors }) => {
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    description: '',
    category: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = {
    income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
    expense: ['Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Healthcare', 'Other']
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate amount
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(parseFloat(formData.amount))) {
      newErrors.amount = 'Amount must be a valid number';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (parseFloat(formData.amount) > 1000000) {
      newErrors.amount = 'Amount cannot exceed $1,000,000';
    }

    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 3) {
      newErrors.description = 'Description must be at least 3 characters';
    } else if (formData.description.trim().length > 100) {
      newErrors.description = 'Description cannot exceed 100 characters';
    }

    // Validate category
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (validateForm()) {
        await onAddEntry({
          ...formData,
          amount: parseFloat(formData.amount),
          description: formData.description.trim()
        });
        
        // Reset form on successful submission
        setFormData({
          type: 'income',
          amount: '',
          description: '',
          category: ''
        });
        setErrors({});
      }
    } catch (error) {
      setErrors({ submit: 'Failed to add entry. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: colors.surface }}>
      <h2 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>
        Add Entry
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div className="p-3 rounded-lg bg-red-100 border border-red-400 text-red-700">
            {errors.submit}
          </div>
        )}

        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="income"
              checked={formData.type === 'income'}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="mr-2"
            />
            <span style={{ color: colors.text }}>Income</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="expense"
              checked={formData.type === 'expense'}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="mr-2"
            />
            <span style={{ color: colors.text }}>Expense</span>
          </label>
        </div>

        <div>
          <input
            type="number"
            step="0.01"
            placeholder="Amount (e.g., 25.50)"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            className={`w-full p-3 rounded-lg border ${errors.amount ? 'border-red-500' : ''}`}
            style={{ 
              backgroundColor: colors.background, 
              borderColor: errors.amount ? '#ef4444' : colors.textSecondary,
              color: colors.text 
            }}
            required
          />
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            placeholder="Description (e.g., Grocery shopping)"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={`w-full p-3 rounded-lg border ${errors.description ? 'border-red-500' : ''}`}
            style={{ 
              backgroundColor: colors.background, 
              borderColor: errors.description ? '#ef4444' : colors.textSecondary,
              color: colors.text 
            }}
            maxLength="100"
            required
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        <div>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className={`w-full p-3 rounded-lg border ${errors.category ? 'border-red-500' : ''}`}
            style={{ 
              backgroundColor: colors.background, 
              borderColor: errors.category ? '#ef4444' : colors.textSecondary,
              color: colors.text 
            }}
            required
          >
            <option value="">Select category</option>
            {categories[formData.type].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">{errors.category}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 rounded-lg text-white font-medium ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{ backgroundColor: colors.primary }}
        >
          {isSubmitting ? 'Adding...' : `Add ${formData.type === 'income' ? 'Income' : 'Expense'}`}
        </button>
      </form>
    </div>
  );
};

export default EntryForm;
