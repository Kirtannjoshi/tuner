import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Header = () => {
    return (
        <div className="sticky top-0 z-20 bg-[#111827]/95 backdrop-blur-xl border-b border-gray-800/50 pb-3 pt-4 px-4 shadow-lg shadow-black/20">
            <div className="flex items-center justify-between gap-4 mb-4">
                {/* App Title */}
                <div className="flex items-center gap-2">
                    <img src={`${import.meta.env.BASE_URL}tuner-logo.svg`} alt="Tuner Logo" className="h-8 w-auto object-contain" />
                </div>

                {/* Search Bar - Compact & Modern */}
                <div className="relative flex-1 max-w-[200px]">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full bg-gray-800/50 border border-gray-700/50 text-white text-xs rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all placeholder-gray-500"
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-2 h-4 w-4 text-gray-500" />
                </div>
            </div>
        </div>
    );
};

export default Header;
