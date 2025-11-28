import { Outlet, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PlayerContext } from '../../contexts/PlayerContext';
import BottomNav from './BottomNav';
import SideNav from './SideNav';
import TunerFullscreenPlayer from '../player/TunerFullscreenPlayer';
import UnifiedPlayer from '../player/UnifiedPlayer';

const Layout = () => {
    const { currentMedia, playerMode, setPlayerMode } = useContext(PlayerContext);
    const location = useLocation();

    // Show fullscreen player
    if (playerMode === 'full' && currentMedia) {
        return <TunerFullscreenPlayer media={currentMedia} onClose={() => setPlayerMode('mini')} />;
    }

    // Check if we are on the watch page
    const isWatchPage = location.pathname.startsWith('/watch/');

    return (
        <div className="min-h-screen bg-gray-900 text-white lg:flex">
            {/* Side Navigation - Desktop Only */}
            <SideNav />

            {/* Main Content */}
            <main className={`flex-1 min-w-0 ${currentMedia && playerMode === 'mini' ? 'pb-32 lg:pb-24' : 'pb-20 lg:pb-0'}`}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Bottom Navigation - Mobile Only */}
            <div className="lg:hidden">
                <BottomNav />
            </div>

            {/* Unified Player - Handles Mini and PiP modes */}
            {!isWatchPage && <UnifiedPlayer />}
        </div>
    );
};

export default Layout;