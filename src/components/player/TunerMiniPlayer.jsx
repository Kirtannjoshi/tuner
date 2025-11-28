import React, { useRef, useEffect } from 'react';
import { Play, Pause, X, Maximize2 } from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * TunerMiniPlayer - Persistent Bottom Player
 * Shows currently playing media with basic controls
 * Positioned above bottom navigation on mobile
 */
const TunerMiniPlayer = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const audioRef = useRef(null);
    const hlsRef = useRef(null);

    const {
        currentMedia,
        isPlaying,
        togglePlayPause,
        stopMedia,
        setPlayerMode,
        volume
    } = usePlayer();

    if (!currentMedia) return null;

    const isVideo = currentMedia.type === 'tv';
    const streamUrl = currentMedia.streamUrl || currentMedia.url;

    // Check if we're on the watch page - if so, don't initialize media (TunerMainPlayer handles it)
    const isOnWatchPage = location.pathname.startsWith('/watch/');

    // Initialize media element ONLY if not on watch page
    useEffect(() => {
        if (isOnWatchPage) return; // Don't initialize if on watch page

        const element = isVideo ? videoRef.current : audioRef.current;
        if (!element || !streamUrl) return;

        // Check if HLS stream
        if (streamUrl.includes('.m3u8')) {
            if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({
                    maxBufferLength: 5,
                    maxMaxBufferLength: 10,
                    lowLatencyMode: true,
                    enableWorker: true,
                });

                hlsRef.current = hls;
                hls.loadSource(streamUrl);
                hls.attachMedia(element);

                hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
                    if (isPlaying) {
                        element.play().catch(err => console.error('Play error:', err));
                    }
                });

                hls.on(window.Hls.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        console.error('HLS fatal error:', data);
                        switch (data.type) {
                            case window.Hls.ErrorTypes.NETWORK_ERROR:
                                hls.startLoad();
                                break;
                            case window.Hls.ErrorTypes.MEDIA_ERROR:
                                hls.recoverMediaError();
                                break;
                            default:
                                break;
                        }
                    }
                });
            } else if (element.canPlayType('application/vnd.apple.mpegurl')) {
                // Native HLS support (Safari)
                element.src = streamUrl;
                element.load();
            }
        } else {
            // Direct stream
            element.src = streamUrl;
            element.load();
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            if (element) {
                element.src = '';
            }
        };
    }, [currentMedia.id, streamUrl, isVideo, isOnWatchPage]);

    // Control playback ONLY if not on watch page
    useEffect(() => {
        if (isOnWatchPage) return; // Don't control playback if on watch page

        const element = isVideo ? videoRef.current : audioRef.current;
        if (!element) return;

        if (isPlaying) {
            element.play().catch(err => console.error('Play error:', err));
        } else {
            element.pause();
        }
    }, [isPlaying, isVideo, isOnWatchPage]);

    // Control volume ONLY if not on watch page
    useEffect(() => {
        if (isOnWatchPage) return; // Don't control volume if on watch page

        const element = isVideo ? videoRef.current : audioRef.current;
        if (element) {
            element.volume = volume;
        }
    }, [volume, isVideo, isOnWatchPage]);

    const handleExpand = () => {
        // Navigate to watch page
        navigate(`/watch/${currentMedia.type}/${currentMedia.id}`);
    };

    return (
        <>
            {/* Hidden media elements */}
            {isVideo ? (
                <video
                    ref={videoRef}
                    className="hidden"
                    playsInline
                    muted={false}
                />
            ) : (
                <audio ref={audioRef} />
            )}

            {/* Mini Player UI - Desktop */}
            <div className="hidden lg:block fixed bottom-0 left-0 right-0 z-40 bg-gray-900/98 backdrop-blur-xl border-t border-gray-700/50 shadow-2xl">
                <div className="max-w-7xl mx-auto px-6 py-3">
                    <div className="flex items-center justify-between gap-4">
                        {/* Media Info */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div
                                className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-800 cursor-pointer hover:scale-105 transition-transform flex-shrink-0"
                                onClick={handleExpand}
                            >
                                {isVideo && videoRef.current ? (
                                    <video
                                        ref={videoRef}
                                        className="w-full h-full object-cover"
                                        muted
                                        playsInline
                                    />
                                ) : (
                                    <img
                                        src={currentMedia.logo || currentMedia.image || '/placeholder.svg'}
                                        alt={currentMedia.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = '/placeholder.svg';
                                        }}
                                    />
                                )}
                                {isPlaying && (
                                    <div className="absolute bottom-1 right-1">
                                        <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3
                                    className="font-semibold text-white truncate cursor-pointer hover:text-pink-400 transition-colors"
                                    onClick={handleExpand}
                                >
                                    {currentMedia.name}
                                </h3>
                                <p className="text-sm text-gray-400 truncate">
                                    {currentMedia.genre || `Live ${currentMedia.type}`}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-xs text-green-400 font-medium">LIVE</span>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={togglePlayPause}
                                className="p-3 bg-pink-500 hover:bg-pink-600 rounded-full text-white shadow-lg hover:shadow-pink-500/25 transition-all hover:scale-105"
                            >
                                {isPlaying ? (
                                    <Pause className="w-6 h-6" />
                                ) : (
                                    <Play className="w-6 h-6 ml-0.5" />
                                )}
                            </button>

                            <button
                                onClick={handleExpand}
                                className="p-2 hover:bg-gray-700/50 rounded-lg text-gray-400 hover:text-white transition-all"
                            >
                                <Maximize2 className="w-5 h-5" />
                            </button>

                            <button
                                onClick={stopMedia}
                                className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mini Player UI - Mobile */}
            <div className="lg:hidden fixed bottom-16 left-0 right-0 z-40 mx-3 mb-2">
                <div className="bg-gray-900/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
                    <div className="flex items-center p-3 gap-3">
                        {/* Media Thumbnail */}
                        <div
                            className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-800 cursor-pointer flex-shrink-0"
                            onClick={handleExpand}
                        >
                            {isVideo && videoRef.current ? (
                                <video
                                    className="w-full h-full object-cover"
                                    muted
                                    playsInline
                                />
                            ) : (
                                <img
                                    src={currentMedia.logo || currentMedia.image || '/placeholder.svg'}
                                    alt={currentMedia.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = '/placeholder.svg';
                                    }}
                                />
                            )}
                            {isPlaying && (
                                <div className="absolute bottom-0.5 right-0.5">
                                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                                </div>
                            )}
                        </div>

                        {/* Media Info */}
                        <div className="flex-1 min-w-0" onClick={handleExpand}>
                            <h3 className="font-semibold text-white text-sm truncate">
                                {currentMedia.name}
                            </h3>
                            <p className="text-xs text-gray-400 truncate">
                                {currentMedia.genre || `Live ${currentMedia.type}`}
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={togglePlayPause}
                                className="p-2.5 bg-pink-500 hover:bg-pink-600 rounded-xl text-white active:scale-95 transition-all"
                            >
                                {isPlaying ? (
                                    <Pause className="w-5 h-5" />
                                ) : (
                                    <Play className="w-5 h-5 ml-0.5" />
                                )}
                            </button>

                            <button
                                onClick={stopMedia}
                                className="p-2 hover:bg-red-500/10 rounded-xl text-gray-400 hover:text-red-400 active:scale-95 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TunerMiniPlayer;
