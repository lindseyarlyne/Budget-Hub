import { useState, useEffect, useCallback, useMemo } from 'react';

// Simulated API service - replace with actual API calls
const budgetService = {
  getBudgetData: async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      income: [
        { id: 1, amount: 3500, category: 'Salary', date: '2024-01-15' },
        { id: 2, amount: 500, category: 'Freelance', date: '2024-01-20' }
      ],
      expenses: [
        { id: 1, amount: 1200, category: 'Housing', date: '2024-01-01' },
        { id: 2, amount: 400, category: 'Food & Dining', date: '2024-01-05' },
        { id: 3, amount: 200, category: 'Transportation', date: '2024-01-10' }
      ]
    };
  },
  
  getPayPeriods: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      {
        id: 1,
        startDate: '2024-01-01',
        endDate: '2024-01-15',
        totalIncome: 2000,
        totalExpenses: 1500,
        remaining: 500,
        isCurrent: false
      },
      {
        id: 2,
        startDate: '2024-01-16',
        endDate: '2024-01-31',
        totalIncome: 2000,
        totalExpenses: 1800,
        remaining: 200,
        isCurrent: true
      }
    ];
  },
  
  getSavingsData: async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      goal: 10000,
      entries: [
        { id: 1, amount: 500, date: '2024-01-15', type: 'deposit' },
        { id: 2, amount: 300, date: '2024-01-31', type: 'deposit' },
        { id: 3, amount: 600, date: '2024-02-15', type: 'deposit' }
      ]
    };
  }
};

// Cache implementation for performance
class DataCache {
  constructor(maxAge = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.maxAge = maxAge;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }
}

const cache = new DataCache();

export const useBudgetData = () => {
  const [budgetData, setBudgetData] = useState(null);
  const [payPeriods, setPayPeriods] = useState(null);
  const [savingsData, setSavingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoized fetch functions to prevent unnecessary recreations
  const fetchBudgetData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check cache first
      const cachedData = cache.get('budgetData');
      if (cachedData) {
        setBudgetData(cachedData);
        setLoading(false);
        return;
      }
      
      const data = await budgetService.getBudgetData();
      cache.set('budgetData', data);
      setBudgetData(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPayPeriods = useCallback(async () => {
    try {
      const cachedData = cache.get('payPeriods');
      if (cachedData) {
        setPayPeriods(cachedData);
        return;
      }
      
      const data = await budgetService.getPayPeriods();
      cache.set('payPeriods', data);
      setPayPeriods(data);
    } catch (err) {
      console.error('Failed to fetch pay periods:', err);
    }
  }, []);

  const fetchSavingsData = useCallback(async () => {
    try {
      const cachedData = cache.get('savingsData');
      if (cachedData) {
        setSavingsData(cachedData);
        return;
      }
      
      const data = await budgetService.getSavingsData();
      cache.set('savingsData', data);
      setSavingsData(data);
    } catch (err) {
      console.error('Failed to fetch savings data:', err);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchBudgetData(),
        fetchPayPeriods(),
        fetchSavingsData()
      ]);
    };
    
    loadData();
  }, [fetchBudgetData, fetchPayPeriods, fetchSavingsData]);

  // Refresh function for manual cache invalidation
  const refreshData = useCallback(() => {
    cache.clear();
    fetchBudgetData();
    fetchPayPeriods();
    fetchSavingsData();
  }, [fetchBudgetData, fetchPayPeriods, fetchSavingsData]);

  // Memoized return value to prevent unnecessary re-renders
  return useMemo(() => ({
    budgetData,
    payPeriods,
    savingsData,
    loading,
    error,
    refreshData
  }), [budgetData, payPeriods, savingsData, loading, error, refreshData]);
};

export const useBudgetActions = () => {
  const [loading, setLoading] = useState(false);

  const addBudgetEntry = useCallback(async (entry) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Invalidate cache to refresh data
      cache.clear();
      
      console.log('Added budget entry:', entry);
      return { success: true };
    } catch (error) {
      console.error('Failed to add budget entry:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBudgetEntry = useCallback(async (id, updates) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      cache.clear();
      console.log('Updated budget entry:', id, updates);
      return { success: true };
    } catch (error) {
      console.error('Failed to update budget entry:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBudgetEntry = useCallback(async (id) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      cache.clear();
      console.log('Deleted budget entry:', id);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete budget entry:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return useMemo(() => ({
    addBudgetEntry,
    updateBudgetEntry,
    deleteBudgetEntry,
    loading
  }), [addBudgetEntry, updateBudgetEntry, deleteBudgetEntry, loading]);
};