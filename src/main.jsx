import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'

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
