import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Lazy load components for code splitting
const BudgetOverview = lazy(() => import('./BudgetOverview'));
const EntryForm = lazy(() => import('./EntryForm'));
const PayPeriodList = lazy(() => import('./PayPeriodList'));
const SavingsTracker = lazy(() => import('./SavingsTracker'));

function App() {
  return (
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
          <Suspense fallback={<div>Loading...</div>}>
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
  );
}

export default App;
