import { StrictMode } from 'react'
import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Error handling wrapper
const ErrorFallback = ({ error }) => {
  console.error('Application Error:', error);
  return (
    <div style={{ padding: '20px', color: 'white', background: '#222', textAlign: 'center' }}>
      <h2>Something went wrong</h2>
      <p>Check the console for more details.</p>
      <button 
        onClick={() => window.location.reload()}
        style={{ padding: '8px 16px', background: '#f06', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Reload App
      </button>
    </div>
  );
};

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

try {
  const root = createRoot(document.getElementById('root'));
  
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
} catch (error) {
  console.error('Error rendering React app:', error);
  document.getElementById('root').innerHTML = 
    '<div style="padding: 20px; color: white; background: #222; text-align: center">' +
    '<h2>Failed to start application</h2>' +
    '<p>' + error.message + '</p>' +
    '</div>';
}
