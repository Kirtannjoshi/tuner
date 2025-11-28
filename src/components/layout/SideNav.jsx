import { NavLink } from 'react-router-dom';
import {
    HomeIcon,
    RadioIcon,
    TvIcon,
    TrophyIcon,
    RectangleStackIcon,
    BookmarkIcon,
    Cog6ToothIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import {
    HomeIcon as HomeSolid,
    RadioIcon as RadioSolid,
    TvIcon as TvSolid,
    TrophyIcon as TrophySolid,
    RectangleStackIcon as RectangleStackSolid,
    BookmarkIcon as BookmarkSolid,
    Cog6ToothIcon as CogSolid
} from '@heroicons/react/24/solid';
import { useState } from 'react';

const SideNav = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navItems = [
        { to: '/', icon: HomeIcon, activeIcon: HomeSolid, label: 'Home' },
        { to: '/radio', icon: RadioIcon, activeIcon: RadioSolid, label: 'Radio' },
        { to: '/tv', icon: TvIcon, activeIcon: TvSolid, label: 'TV' },
        { to: '/library', icon: BookmarkIcon, activeIcon: BookmarkSolid, label: 'Library' },
        { to: '/settings', icon: Cog6ToothIcon, activeIcon: CogSolid, label: 'Settings' },
    ];

    return (
        <aside
            className={`hidden lg:flex flex-col sticky top-0 h-screen bg-transparent z-30 transition-all duration-300 w-64`}
        >
            {/* Logo & Toggle */}
            <div className="flex items-center justify-between p-4">
                <NavLink to="/" className="flex items-center">
                    <div className="h-10 w-32 flex items-center justify-start overflow-hidden">
                        <img
                            src="/header-logo.png"
                            alt="TUNER Logo"
                            className="h-full w-auto object-contain"
                        />
                    </div>
                </NavLink>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 overflow-y-auto py-4 px-2">
                <div className="space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-pink-500/20 text-pink-400'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                }`
                            }
                            end={item.to === '/'}
                        >
                            {({ isActive }) => (
                                <>
                                    <div className="relative">
                                        {isActive ? (
                                            <item.activeIcon className="w-6 h-6" />
                                        ) : (
                                            <item.icon className="w-6 h-6" />
                                        )}
                                        {isActive && (
                                            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-pink-500 rounded-r-full" />
                                        )}
                                    </div>
                                    <span className="font-medium text-sm">{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* User Section (Optional) */}
            <div className="p-4 space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/30">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        U
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">User</p>
                        <p className="text-xs text-gray-400 truncate">Free Plan</p>
                    </div>
                </div>

                {/* Version Info */}
                <div className="px-2 text-[10px] text-gray-600 font-mono">
                    <p>App v1.0</p>
                    <p>Player v0.001</p>
                </div>
            </div>
        </aside>
    );
};

export default SideNav;
