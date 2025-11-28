import { NavLink } from 'react-router-dom';
import { HomeIcon, RadioIcon, TvIcon, TrophyIcon, RectangleStackIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolid,
  RadioIcon as RadioSolid,
  TvIcon as TvSolid,
  TrophyIcon as TrophySolid,
  RectangleStackIcon as RectangleStackSolid,
  BookmarkIcon as BookmarkSolid
} from '@heroicons/react/24/solid';
import UnifiedMediaIcon from '../common/UnifiedMediaIcon';

const BottomNav = () => {
  const navItems = [
    { to: '/', icon: HomeIcon, activeIcon: HomeSolid, label: 'Home' },
    { to: '/radio', icon: RadioIcon, activeIcon: RadioSolid, label: 'Radio' },
    { to: '/tv', icon: TvIcon, activeIcon: TvSolid, label: 'TV' },
    { to: '/library', icon: BookmarkIcon, activeIcon: BookmarkSolid, label: 'Library' },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30">
      {/* Material 3 Bottom Navigation Bar */}
      <div className="bg-gray-900/95 backdrop-blur-xl border-t border-gray-700/30 shadow-2xl">
        <nav className="flex justify-around items-center px-2 py-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex flex-col items-center justify-center px-3 py-2 rounded-2xl transition-all duration-300 min-w-[64px] ${isActive
                  ? 'bg-pink-500/20 text-pink-400'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
                }`
              }
              end={item.to === '/'}
            >
              {({ isActive }) => (
                <>
                  {/* Icon container with Material 3 badge effect */}
                  <div className={`relative p-1 rounded-xl transition-all duration-300 ${isActive
                    ? 'bg-pink-500/30 text-pink-300 scale-110'
                    : 'group-hover:bg-gray-600/40'
                    }`}>
                    {isActive ? (
                      <item.activeIcon className="h-6 w-6" />
                    ) : (
                      <item.icon className="h-6 w-6" />
                    )}

                    {/* Active indicator dot */}
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                        <div className="w-1 h-1 bg-pink-400 rounded-full"></div>
                      </div>
                    )}
                  </div>

                  {/* Label with Material 3 typography */}
                  <span className={`text-xs font-medium mt-1 transition-all duration-300 ${isActive
                    ? 'text-pink-300 font-semibold'
                    : 'text-gray-400 group-hover:text-gray-300'
                    }`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom safe area for iOS */}
        <div className="h-safe-bottom bg-gray-900/95"></div>
      </div>
    </div>
  );
};

export default BottomNav;