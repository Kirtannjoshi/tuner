import { NavLink } from 'react-router-dom';
import { HomeIcon, RadioIcon, TvIcon, HeartIcon } from '@heroicons/react/24/outline';

const BottomNav = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-20">
      <nav className="flex justify-around items-center h-16">
        <NavLink
          to="/"
          className={({ isActive }) => 
            `flex flex-col items-center pt-2 pb-1 px-4 ${isActive ? 'text-pink-500' : 'text-gray-400'}`
          }
          end
        >
          <HomeIcon className="h-6 w-6 mb-1" />
          <span className="text-xs">Home</span>
        </NavLink>
        <NavLink
          to="/radio"
          className={({ isActive }) => 
            `flex flex-col items-center pt-2 pb-1 px-4 ${isActive ? 'text-pink-500' : 'text-gray-400'}`
          }
        >
          <RadioIcon className="h-6 w-6 mb-1" />
          <span className="text-xs">Radio</span>
        </NavLink>
        <NavLink
          to="/tv"
          className={({ isActive }) => 
            `flex flex-col items-center pt-2 pb-1 px-4 ${isActive ? 'text-pink-500' : 'text-gray-400'}`
          }
        >
          <TvIcon className="h-6 w-6 mb-1" />
          <span className="text-xs">TV</span>
        </NavLink>
        <NavLink
          to="/favorites"
          className={({ isActive }) => 
            `flex flex-col items-center pt-2 pb-1 px-4 ${isActive ? 'text-pink-500' : 'text-gray-400'}`
          }
        >
          <HeartIcon className="h-6 w-6 mb-1" />
          <span className="text-xs">Favorites</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default BottomNav; 