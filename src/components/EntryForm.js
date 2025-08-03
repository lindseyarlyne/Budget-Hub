import React, { useState } from 'react';

const EntryForm = ({ onAddEntry, colors }) => {
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    description: '',
    category: ''
  });

  const categories = {
    income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
    expense: ['Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Healthcare', 'Other']
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.amount && formData.description) {
      onAddEntry({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      setFormData({
        type: 'income',
        amount: '',
        description: '',
        category: ''
      });
    }
  };

  return (
    <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: colors.surface }}>
      <h2 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>
        Add Entry
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="income"
              checked={formData.type === 'income'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="mr-2"
            />
            <span style={{ color: colors.text }}>Income</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="expense"
              checked={formData.type === 'expense'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="mr-2"
            />
            <span style={{ color: colors.text }}>Expense</span>
          </label>
        </div>

        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="w-full p-3 rounded-lg border"
          style={{ 
            backgroundColor: colors.background, 
            borderColor: colors.textSecondary,
            color: colors.text 
          }}
          required
        />

        <input
          type="text"
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full p-3 rounded-lg border"
          style={{ 
            backgroundColor: colors.background, 
            borderColor: colors.textSecondary,
            color: colors.text 
          }}
          required
        />

        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full p-3 rounded-lg border"
          style={{ 
            backgroundColor: colors.background, 
            borderColor: colors.textSecondary,
            color: colors.text 
          }}
        >
          <option value="">Select category</option>
          {categories[formData.type].map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <button
          type="submit"
          className="w-full py-3 rounded-lg text-white font-medium"
          style={{ backgroundColor: colors.primary }}
        >
          Add {formData.type === 'income' ? 'Income' : 'Expense'}
        </button>
      </form>
    </div>
  );
};

export default EntryForm;
