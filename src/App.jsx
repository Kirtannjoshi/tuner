import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import RadioPage from './pages/RadioPage';
import TvPage from './pages/TvPage';
import FavoritesPage from './pages/FavoritesPage';
import HomePage from './pages/HomePage';
import { PlayerProvider } from './contexts/PlayerContext';

function App() {
  return (
    <PlayerProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="radio" element={<RadioPage />} />
            <Route path="tv" element={<TvPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
          </Route>
        </Routes>
      </Router>
    </PlayerProvider>
  );
}

export default App;
