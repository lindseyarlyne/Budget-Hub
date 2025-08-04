import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

// Lazy load components for code splitting
const BudgetOverview = lazy(() => import('./components/BudgetOverview'));
const EntryForm = lazy(() => import('./components/EntryForm'));
const EntryList = lazy(() => import('./components/EntryList'));
const PayPeriodList = lazy(() => import('./components/PayPeriodList'));
const SavingsTracker = lazy(() => import('./components/SavingsTracker'));

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="app">
          <header className="app-header">
            <img 
              src="https://cdn.pixabay.com/photo/2022/08/21/19/16/quartz-7402870_1280.png" 
              className="crystals" 
              alt="Decorative crystal gems"
              loading="lazy"
            />
            <h1>Whimsy Grove</h1>
            <nav>
              <Link to="/">Overview</Link>
              <Link to="/entry">Add Entry</Link>
              <Link to="/entries">Edit Entries</Link>
              <Link to="/periods">Pay Periods</Link>
              <Link to="/savings">Savings</Link>
            </nav>
          </header>
          
          <main className="app-main">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<BudgetOverview />} />
                <Route path="/entry" element={<EntryForm />} />
                <Route path="/entries" element={<EntryList />} />
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