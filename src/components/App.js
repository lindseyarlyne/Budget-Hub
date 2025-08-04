import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

// Lazy load components for code splitting
const BudgetOverview = lazy(() => import('./components/BudgetOverview'));
const EntryForm = lazy(() => import('./components/EntryForm'));
const PayPeriodList = lazy(() => import('./components/PayPeriodList'));
const SavingsTracker = lazy(() => import('./components/SavingsTracker'));

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="app">
          <header className="app-header">
            <h1>Budget Hub</h1>
            <nav>
              <a href="#overview">Overview</a>
              <a href="#entry">Add Entry</a>
              <a href="#periods">Pay Periods</a>
              <a href="#savings">Savings</a>
            </nav>
          </header>
          
          <main className="app-main">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<BudgetOverview />} />
                <Route path="/entry" element={<EntryForm />} />
                <Route path="/periods" element={<PayPeriodList />} />
                <Route path="/savings" element={<SavingsTracker />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
