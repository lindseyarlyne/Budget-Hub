import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, X, Target, Home, Search, Calendar, ArrowLeft } from 'lucide-react';

const BudgetHub = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formType, setFormType] = useState('income');
  const [savingsGoal, setSavingsGoal] = useState(5000);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [bills, setBills] = useState([]);
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [currentView, setCurrentView] = useState('overview');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    person: 'Lindsey'
  });

  const colors = {
    primary: '#d8a88c',
    secondary: '#eac7b1',
    background: '#f5ebe1',
    surface: '#F8F8F8',
    text: '#3e2f25',
    textSecondary: '#666666',
    success: '#a7b79b',
    error: '#d49c88'
  };

  const initializeData = () => {
    setIncome([
      { person: 'Lindsey', amount: 1601, notes: 'Salary', id: 1 },
      { person: 'Lindsey', amount: 180, notes: 'UHC', id: 2 }
    ]);
    setExpenses([
      { description: 'Britbox', amount: 8.99, category: 'Subscriptions', id: 1 },
      { description: 'Apple Card', amount: 156, category: 'Debt', id: 2 }
    ]);
    setBills([
      { id: 1, name: 'Rent', amount: 1200, dueDate: 1, category: 'Housing', autopay: false },
      { id: 2, name: 'Electric Bill', amount: 95, dueDate: 15, category: 'Utilities', autopay: true }
    ]);
    setDataLoaded(true);
  };

  useEffect(() => {
    initializeData();
  }, []);

  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalSavings = totalIncome - totalExpenses;
  const savingsProgress = Math.min((totalSavings / savingsGoal) * 100, 100);
  const weeklyRemaining = totalSavings / 4.33;

  const getUpcomingBills = () => {
    const today = new Date();
    return bills.map(bill => {
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), bill.dueDate);
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, bill.dueDate);
      const nextDue = thisMonth >= today ? thisMonth : nextMonth;
      const daysUntil = Math.ceil((nextDue - today) / (1000 * 60 * 60 * 24));
      return { ...bill, daysUntil };
    }).filter(bill => bill.daysUntil >= 0 && bill.daysUntil <= 30);
  };

  const handleFormSubmit = () => {
    if (!formData.amount || !formData.description) return;
    
    const newEntry = {
      amount: parseFloat(formData.amount),
      description: formData.description,
      notes: formData.description,
      category: formData.category,
      person: formData.person,
      id: editingItem ? editingItem.id : Date.now()
    };

    if (editingItem) {
      // Update existing item
      if (formType === 'income') {
        setIncome(prev => prev.map(item => 
          item.id === editingItem.id ? newEntry : item
        ));
      } else {
        setExpenses(prev => prev.map(item => 
          item.id === editingItem.id ? newEntry : item
        ));
      }
      setEditingItem(null);
    } else {
      // Add new item
      if (formType === 'income') {
        setIncome(prev => [...prev, newEntry]);
      } else {
        setExpenses(prev => [...prev, newEntry]);
      }
    }

    setShowAddForm(false);
    setFormData({ amount: '', description: '', category: '', person: 'Lindsey' });
  };

  const handleEditItem = (item, type) => {
    setEditingItem(item);
    setFormType(type);
    setFormData({
      amount: item.amount.toString(),
      description: type === 'income' ? item.notes : item.description,
      category: item.category || '',
      person: item.person || 'Lindsey'
    });
    setShowAddForm(true);
  };

  const handleDeleteItem = (id, type) => {
    if (type === 'income') {
      setIncome(prev => prev.filter(item => item.id !== id));
    } else {
      setExpenses(prev => prev.filter(item => item.id !== id));
    }
  };

  const searchTransactions = (query) => {
    if (!query.trim()) return [];
    const searchTerm = query.toLowerCase();
    const results = [];
    
    income.forEach(item => {
      if (item.notes?.toLowerCase().includes(searchTerm) || 
          item.person?.toLowerCase().includes(searchTerm)) {
        results.push({ ...item, type: 'income' });
      }
    });
    
    expenses.forEach(item => {
      if (item.description?.toLowerCase().includes(searchTerm) || 
          item.category?.toLowerCase().includes(searchTerm)) {
        results.push({ ...item, type: 'expense' });
      }
    });
    
    return results;
  };

  if (!dataLoaded) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex items-center justify-center" 
           style={{ backgroundColor: colors.background }}>
        <div className="text-center p-8">
          <div className="text-xl font-medium mb-2" style={{ color: colors.text }}>
            Loading...
          </div>

      <div className="fixed bottom-0 left-0 right-0 border-t px-4 py-2"
           style={{ backgroundColor: colors.background, borderColor: colors.surface }}>
        <div className="flex justify-around items-center">
          <button 
            onClick={() => {
              setCurrentView('overview');
              setShowSearch(false);
            }}
            className="p-2 rounded-lg transition-opacity"
          >
            <Home className="w-6 h-6" style={{ 
              color: currentView === 'overview' ? colors.primary : colors.textSecondary 
            }} />
          </button>
          <button 
            onClick={() => setShowSearch(true)}
            className="p-2 rounded-lg transition-opacity"
          >
            <Search className="w-6 h-6" style={{ color: colors.textSecondary }} />
          </button>
          <button 
            onClick={() => setCurrentView('bills')}
            className="p-2 rounded-lg transition-opacity"
          >
            <Calendar className="w-6 h-6" style={{ 
              color: currentView === 'bills' ? colors.primary : colors.textSecondary 
            }} />
          </button>
        </div>
      </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen relative" style={{ backgroundColor: colors.background }}>
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: colors.surface }}>
        <div>
          <div className="text-lg" style={{ color: colors.text }}>Budget Hub</div>
          <div className="text-sm" style={{ color: colors.textSecondary }}>Personal Finance</div>
        </div>
      </div>

      <div className="p-4">
        <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: colors.surface }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Target className="w-5 h-5 mr-2" style={{ color: colors.primary }} />
              <span className="font-medium" style={{ color: colors.text }}>Savings Goal</span>
            </div>
            <button 
              onClick={() => setShowGoalForm(true)}
              className="text-sm px-3 py-1 rounded-full"
              style={{ backgroundColor: colors.primary, color: 'white' }}
            >
              Edit
            </button>
          </div>
          
          <div className="mb-2">
            <div className="flex justify-between text-sm" style={{ color: colors.textSecondary }}>
              <span>${Math.floor(savingsProgress * savingsGoal / 100)}</span>
              <span>${savingsGoal}</span>
            </div>
            <div className="w-full h-3 rounded-full mt-1" style={{ backgroundColor: colors.background }}>
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ backgroundColor: colors.secondary, width: `${savingsProgress}%` }}
              />
            </div>
          </div>
          
          <div className="text-sm" style={{ color: colors.textSecondary }}>
            {savingsProgress.toFixed(1)}% of goal reached
          </div>
        </div>

        <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: colors.surface }}>
          <h3 className="font-medium mb-3" style={{ color: colors.text }}>Weekly Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm" style={{ color: colors.textSecondary }}>Weekly Income</div>
              <div className="text-lg font-medium" style={{ color: colors.success }}>
                ${(totalIncome / 4.33).toFixed(0)}
              </div>
            </div>
            <div>
              <div className="text-sm" style={{ color: colors.textSecondary }}>Weekly Expenses</div>
              <div className="text-lg font-medium" style={{ color: colors.error }}>
                ${(totalExpenses / 4.33).toFixed(0)}
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t" style={{ borderColor: colors.background }}>
            <div className="text-sm" style={{ color: colors.textSecondary }}>Remaining per Week</div>
            <div className="text-xl font-medium" style={{ 
              color: weeklyRemaining >= 0 ? colors.success : colors.error 
            }}>
              ${weeklyRemaining.toFixed(0)}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: colors.surface }}>
          <h3 className="font-medium mb-3" style={{ color: colors.text }}>Upcoming Bills</h3>
          
          {getUpcomingBills().length === 0 ? (
            <div className="text-center py-4" style={{ color: colors.textSecondary }}>
              No upcoming bills
            </div>
          ) : (
            <div className="space-y-2">
              {getUpcomingBills().map((bill) => {
                const isDueSoon = bill.daysUntil <= 3;
                
                return (
                  <div key={bill.id} className="flex items-center justify-between p-2 rounded" 
                       style={{ backgroundColor: isDueSoon ? '#fff3cd' : colors.background }}>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="font-medium" style={{ color: colors.text }}>
                          {bill.name}
                        </div>
                        {bill.autopay && (
                          <span className="text-xs ml-2 px-2 py-1 rounded-full" 
                                style={{ backgroundColor: colors.success, color: 'white' }}>
                            Auto
                          </span>
                        )}

      {showSearch && (
        <div className="fixed inset-0 z-50" style={{ backgroundColor: colors.background }}>
          <div className="flex items-center p-4 border-b" style={{ borderColor: colors.surface }}>
            <button 
              onClick={() => {
                setShowSearch(false);
                setSearchQuery('');
              }} 
              className="mr-3 p-2 rounded"
              style={{ backgroundColor: colors.surface }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: colors.textSecondary }} />
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="flex-1 p-2 rounded-lg border-0"
              style={{ backgroundColor: colors.surface, color: colors.text }}
              autoFocus
            />
          </div>
          
          <div className="p-4">
            {searchQuery.trim() === '' ? (
              <div className="text-center py-8" style={{ color: colors.textSecondary }}>
                Type to search transactions...
              </div>
            ) : searchTransactions(searchQuery).length === 0 ? (
              <div className="text-center py-8" style={{ color: colors.textSecondary }}>
                No transactions found for "{searchQuery}"
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm" style={{ color: colors.textSecondary }}>
                  Found {searchTransactions(searchQuery).length} results
                </div>
                {searchTransactions(searchQuery).map((result, index) => (
                  <div 
                    key={index}
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: colors.surface }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium" style={{ color: colors.text }}>
                          {result.type === 'income' ? result.notes : result.description}
                        </div>
                        <div className="text-sm" style={{ color: colors.textSecondary }}>
                          {result.category && `${result.category} • `}
                          {result.person && result.type === 'income' && result.person}
                        </div>
                      </div>
                      <div className="text-right">
                        <div 
                          className="font-medium"
                          style={{ color: result.type === 'income' ? colors.success : colors.error }}
                        >
                          {result.type === 'income' ? '+' : '-'}${result.amount}
                        </div>
                        <div className="text-xs" style={{ color: colors.textSecondary }}>
                          {result.type === 'income' ? 'Income' : 'Expense'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
                      </div>
                      <div className="text-sm" style={{ color: colors.textSecondary }}>
                        {bill.category}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium" style={{ color: colors.error }}>
                        ${bill.amount}
                      </div>
                      <div className="text-xs" style={{ color: colors.textSecondary }}>
                        {bill.daysUntil === 0 ? 'Due today' :
                         bill.daysUntil === 1 ? 'Due tomorrow' :
                         `Due in ${bill.daysUntil} days`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: colors.surface }}>
          <h3 className="font-medium mb-3" style={{ color: colors.text }}>August Transactions</h3>
          
          <div className="mb-4">
            <h4 className="font-medium text-sm mb-2" style={{ color: colors.success }}>
              Income ({income.length} entries)
            </h4>
            <div className="space-y-1">
              {income.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm py-1">
                  <div className="flex-1">
                    <div style={{ color: colors.text }}>{item.notes}</div>
                    <div style={{ color: colors.textSecondary, fontSize: '12px' }}>
                      {item.person}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="font-medium" style={{ color: colors.success }}>
                      +${item.amount}
                    </div>
                    <button 
                      onClick={() => handleEditItem(item, 'income')}
                      className="text-xs px-2 py-1 rounded"
                      style={{ backgroundColor: colors.primary, color: 'white' }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteItem(item.id, 'income')}
                      className="text-xs px-2 py-1 rounded"
                      style={{ backgroundColor: colors.error, color: 'white' }}
                    >
                      Del
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2" style={{ color: colors.error }}>
              Expenses ({expenses.length} entries)
            </h4>
            <div className="space-y-1">
              {expenses.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm py-1">
                  <div className="flex-1">
                    <div style={{ color: colors.text }}>{item.description}</div>
                    <div style={{ color: colors.textSecondary, fontSize: '12px' }}>
                      {item.category || 'Uncategorized'}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="font-medium" style={{ color: colors.error }}>
                      -${item.amount}
                    </div>
                    <button 
                      onClick={() => handleEditItem(item, 'expense')}
                      className="text-xs px-2 py-1 rounded"
                      style={{ backgroundColor: colors.primary, color: 'white' }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteItem(item.id, 'expense')}
                      className="text-xs px-2 py-1 rounded"
                      style={{ backgroundColor: colors.error, color: 'white' }}
                    >
                      Del
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="rounded-t-2xl p-8 text-center"
               style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
            <h2 className="text-3xl font-serif tracking-wide text-white">
              August
            </h2>
          </div>
          <div className="rounded-b-2xl p-6" style={{ backgroundColor: colors.surface }}>
            <div className="text-sm mb-3" style={{ color: colors.textSecondary }}>
              {new Date().getDate()} Aug
            </div>
            <div className="text-center">
              <div className="mb-2" style={{ color: colors.textSecondary }}>Actual / Budget</div>
              <div className="space-y-1">
                <div style={{ color: colors.text }}>
                  Income: <span style={{ color: colors.success }}>${totalIncome.toFixed(0)}</span> / $4110
                </div>
                <div style={{ color: colors.text }}>
                  Expenses: <span style={{ color: colors.error }}>${totalExpenses.toFixed(0)}</span> / $0
                </div>
                <div style={{ color: colors.text }}>
                  Savings: <span style={{ color: totalSavings >= 0 ? colors.success : colors.error }}>
                    ${totalSavings.toFixed(0)}
                  </span> / $4110
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-20 right-4 space-y-3">
        <button 
          onClick={() => { setFormType('income'); setShowAddForm(true); }}
          className="rounded-full p-3 shadow-lg"
          style={{ backgroundColor: colors.success }}
        >
          <TrendingUp className="w-6 h-6 text-white" />
        </button>
        <button 
          onClick={() => { setFormType('expense'); setShowAddForm(true); }}
          className="rounded-full p-3 shadow-lg"
          style={{ backgroundColor: colors.error }}
        >
          <TrendingDown className="w-6 h-6 text-white" />
        </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ backgroundColor: colors.surface }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium" style={{ color: colors.text }}>
                {editingItem ? 'Edit' : 'Add'} {formType === 'income' ? 'Income' : 'Expense'}
              </h3>
              <button onClick={() => setShowAddForm(false)} style={{ color: colors.textSecondary }}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="number" 
                step="0.01" 
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full p-3 rounded-lg border-0"
                style={{ backgroundColor: colors.background, color: colors.text }}
                placeholder="Amount"
              />
              <input
                type="text" 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-3 rounded-lg border-0"
                style={{ backgroundColor: colors.background, color: colors.text }}
                placeholder="Description"
              />
              {formType === 'expense' && (
                <input
                  type="text" 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full p-3 rounded-lg border-0"
                  style={{ backgroundColor: colors.background, color: colors.text }}
                  placeholder="Category"
                />
              )}
              {formType === 'income' && (
                <input
                  type="text" 
                  value={formData.person}
                  onChange={(e) => setFormData({...formData, person: e.target.value})}
                  className="w-full p-3 rounded-lg border-0"
                  style={{ backgroundColor: colors.background, color: colors.text }}
                  placeholder="Person"
                />
              )}
              <button
                onClick={handleFormSubmit}
                className="w-full py-3 rounded-lg text-white font-medium"
                style={{ backgroundColor: colors.primary }}
              >
                {editingItem ? 'Update' : 'Add'} {formType === 'income' ? 'Income' : 'Expense'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showGoalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm rounded-2xl p-6" style={{ backgroundColor: colors.surface }}>
            <h3 className="text-xl font-medium mb-4" style={{ color: colors.text }}>Set Savings Goal</h3>
            <input
              type="number"
              value={savingsGoal}
              onChange={(e) => setSavingsGoal(Number(e.target.value))}
              className="w-full p-3 rounded-lg border-0 mb-4"
              style={{ backgroundColor: colors.background, color: colors.text }}
              placeholder="Goal amount"
            />
            <button
              onClick={() => setShowGoalForm(false)}
              className="w-full py-3 rounded-lg text-white font-medium"
              style={{ backgroundColor: colors.primary }}
            >
              Save Goal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetHub;