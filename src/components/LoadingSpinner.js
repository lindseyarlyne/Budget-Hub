import React from 'react';

const LoadingSpinner = React.memo(() => {
  return (
    <div className="loading-spinner" role="status" aria-label="Loading">
      <div className="spinner">
        <div className="spinner-circle"></div>
      </div>
      <span className="loading-text">Loading...</span>
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;