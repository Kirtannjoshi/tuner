import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import { PlayerProvider } from './contexts/PlayerContext';

// Lazy load pages
const RadioPage = lazy(() => import('./pages/RadioPage'));
const TvPage = lazy(() => import('./pages/TvPage'));
const ArchivePage = lazy(() => import('./pages/ArchivePage'));
const LibraryPage = lazy(() => import('./pages/LibraryPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const SportPage = lazy(() => import('./pages/SportPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const TunerMainPlayer = lazy(() => import('./components/player/TunerMainPlayer'));

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Router basename={import.meta.env.BASE_URL}>
        <PlayerProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="radio" element={<RadioPage />} />
                <Route path="tv" element={<TvPage />} />
                <Route path="archive" element={<ArchivePage />} />
                <Route path="sport" element={<SportPage />} />
                <Route path="library" element={<LibraryPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="watch/:type/:id" element={<TunerMainPlayer />} />
              </Route>
            </Routes>
          </Suspense>
        </PlayerProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
