import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { RadioIcon, TvIcon, HeartIcon, Bars3Icon, XMarkIcon, HomeIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useContext, useState, useEffect } from 'react';
import { PlayerContext } from '../../contexts/PlayerContext';
import BottomNav from './BottomNav';
import UnifiedPlayer from '../player/UnifiedPlayer';

const Layout = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentMedia } = useContext(PlayerContext);
  const location = useLocation();
  const path = location.pathname;

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className={`${scrolled ? 'bg-gray-800/95 backdrop-blur-sm shadow-lg' : 'bg-gray-800'} sticky top-0 z-30 transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            {/* Logo on left */}
            <NavLink to="/" className="flex items-center">
              <div className="h-10 w-32 flex items-center justify-center overflow-hidden">
                <img 
                  src="/tuner-logo.svg" 
                  alt="TUNER Logo" 
                  className="h-full w-full object-contain" 
                />
              </div>
            </NavLink>

            {/* Desktop Nav - Center */}
            <nav className="hidden md:flex space-x-4 flex-1 justify-center">
              <NavLink
                to="/"
                className={({ isActive }) => 
                  `flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive ? 'bg-pink-600 text-white' : 'hover:bg-gray-700'}`
                }
                end
              >
                <HomeIcon className="h-5 w-5 mr-2" />
                Home
              </NavLink>
              <NavLink
                to="/radio"
                className={({ isActive }) => 
                  `flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive ? 'bg-pink-600 text-white' : 'hover:bg-gray-700'}`
                }
              >
                <RadioIcon className="h-5 w-5 mr-2" />
                Radio
              </NavLink>
              <NavLink
                to="/tv"
                className={({ isActive }) => 
                  `flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive ? 'bg-pink-600 text-white' : 'hover:bg-gray-700'}`
                }
              >
                <TvIcon className="h-5 w-5 mr-2" />
                TV
              </NavLink>
            </nav>

            {/* Favorites button - Right side */}
            <div className="flex items-center">
              <NavLink
                to="/favorites"
                className={({ isActive }) => 
                  `flex items-center p-2 rounded-md ${isActive ? 'text-pink-500' : 'text-gray-300 hover:text-white'}`
                }
                title="Favorites"
              >
                <HeartIcon className="h-6 w-6" />
              </NavLink>
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden flex items-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 ml-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800 border-t border-gray-700">
              <NavLink
                to="/"
                className={({ isActive }) => 
                  `flex items-center px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-pink-600 text-white' : 'hover:bg-gray-700'}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
                end
              >
                <HomeIcon className="h-5 w-5 mr-2" />
                Home
              </NavLink>
              <NavLink
                to="/radio"
                className={({ isActive }) => 
                  `flex items-center px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-pink-600 text-white' : 'hover:bg-gray-700'}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <RadioIcon className="h-5 w-5 mr-2" />
                Radio
              </NavLink>
              <NavLink
                to="/tv"
                className={({ isActive }) => 
                  `flex items-center px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-pink-600 text-white' : 'hover:bg-gray-700'}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <TvIcon className="h-5 w-5 mr-2" />
                TV
              </NavLink>
              <NavLink
                to="/favorites"
                className={({ isActive }) => 
                  `flex items-center px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-pink-600 text-white' : 'hover:bg-gray-700'}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <HeartIcon className="h-5 w-5 mr-2" />
                Favorites
              </NavLink>
            </div>
          </div>
        )}
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      
      {/* Bottom navigation for mobile */}
      <div className="md:hidden">
        <BottomNav />
      </div>
      
      {/* Unified Player for background playback */}
      {currentMedia && (
        <UnifiedPlayer />
      )}
    </div>
  );
};

export default Layout;