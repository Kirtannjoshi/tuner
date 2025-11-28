import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, X, Maximize2, Minimize2, Music } from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';
import { useLocation, useNavigate } from 'react-router-dom';
import Hls from 'hls.js';

/**
 * UnifiedPlayer - Handles both Mini and PiP modes
 * Persists media playback during transitions
 */
const UnifiedPlayer = () => {
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
        playerMode,
        setPlayerMode,
        volume
    } = usePlayer();

    // Drag and Resize State
    const [position, setPosition] = useState({ x: window.innerWidth - 340, y: window.innerHeight - 240 });
    const [size, setSize] = useState({ width: 320, height: 180 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const isVideo = currentMedia?.type === 'tv';
    const streamUrl = currentMedia?.streamUrl || currentMedia?.url;
    const isOnWatchPage = location.pathname.startsWith('/watch/');

    // Initialize media
    useEffect(() => {
        if (!currentMedia) return;

        const element = isVideo ? videoRef.current : audioRef.current;
        if (!element || !streamUrl) return;

        // Check for HLS
        if (streamUrl.includes('.m3u8') || (isVideo && Hls.isSupported())) {
            if (Hls.isSupported()) {
                if (hlsRef.current) {
                    hlsRef.current.destroy();
                }

                const hls = new Hls({
                    maxBufferLength: 30,
                    enableWorker: true,
                    lowLatencyMode: true,
                });

                hlsRef.current = hls;
                hls.loadSource(streamUrl);
                hls.attachMedia(element);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    if (isPlaying) element.play().catch(e => console.error(e));
                });
            } else if (element.canPlayType('application/vnd.apple.mpegurl')) {
                element.src = streamUrl;
            }
        } else {
            element.src = streamUrl;
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [streamUrl, isVideo, currentMedia]);

    // Sync Playback State
    useEffect(() => {
        if (!currentMedia) return;
        const element = isVideo ? videoRef.current : audioRef.current;
        if (!element) return;

        if (isPlaying) {
            element.play().catch(e => console.error("Play failed", e));
        } else {
            element.pause();
        }
    }, [isPlaying, isVideo, currentMedia]);

    // Sync Volume
    useEffect(() => {
        if (!currentMedia) return;
        const element = isVideo ? videoRef.current : audioRef.current;
        if (element) element.volume = volume;
    }, [volume, isVideo, currentMedia]);

    // Media Session API for Background Play
    useEffect(() => {
        if (!currentMedia || !('mediaSession' in navigator)) return;

        navigator.mediaSession.metadata = new MediaMetadata({
            title: currentMedia.name,
            artist: currentMedia.genre || 'Tuner Stream',
            artwork: [
                { src: currentMedia.logo || currentMedia.image || '/placeholder.svg', sizes: '96x96', type: 'image/png' },
                { src: currentMedia.logo || currentMedia.image || '/placeholder.svg', sizes: '128x128', type: 'image/png' },
                { src: currentMedia.logo || currentMedia.image || '/placeholder.svg', sizes: '192x192', type: 'image/png' },
                { src: currentMedia.logo || currentMedia.image || '/placeholder.svg', sizes: '512x512', type: 'image/png' },
            ]
        });

        navigator.mediaSession.setActionHandler('play', () => {
            if (!isPlaying) togglePlayPause();
        });
        navigator.mediaSession.setActionHandler('pause', () => {
            if (isPlaying) togglePlayPause();
        });
        navigator.mediaSession.setActionHandler('stop', () => {
            stopMedia();
        });

        return () => {
            navigator.mediaSession.setActionHandler('play', null);
            navigator.mediaSession.setActionHandler('pause', null);
            navigator.mediaSession.setActionHandler('stop', null);
        };
    }, [currentMedia, isPlaying, togglePlayPause, stopMedia]);

    // Handle Window Resize
    useEffect(() => {
        const handleResize = () => {
            setPosition(prev => ({
                x: Math.min(prev.x, window.innerWidth - size.width - 20),
                y: Math.min(prev.y, window.innerHeight - size.height - 20)
            }));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [size]);

    // Drag Handlers
    const handleMouseDown = (e) => {
        if (playerMode !== 'pip') return;
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;

        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        // Boundary checks
        const boundedX = Math.max(0, Math.min(window.innerWidth - size.width, newX));
        const boundedY = Math.max(0, Math.min(window.innerHeight - size.height, newY));

        setPosition({ x: boundedX, y: boundedY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset]);

    // If no media or player is hidden/full, don't render (or render null)
    if (!currentMedia || playerMode === 'hidden' || playerMode === 'full') return null;

    // If we are on the watch page, hide this player
    if (isOnWatchPage) return null;

    const handleExpand = () => {
        navigate(`/watch/${currentMedia.type}/${currentMedia.id}`);
    };

    // --- RENDER ---

    // Common styles
    const containerBase = "fixed z-50 transition-shadow duration-300 ease-in-out shadow-2xl overflow-hidden bg-gray-900 border border-gray-700/50";

    // Mode specific styles
    const getStyles = () => {
        if (playerMode === 'pip') {
            return {
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: `${size.width}px`,
                height: `${size.height}px`,
                borderRadius: '0.75rem',
                cursor: isDragging ? 'grabbing' : 'grab'
            };
        } else {
            return {
                bottom: '60px', // Mobile bottom nav height
                left: 0,
                right: 0,
                height: '64px',
                borderTopLeftRadius: '0.75rem',
                borderTopRightRadius: '0.75rem',
                borderTopWidth: '1px'
            };
        }
    };

    return (
        <div
            className={containerBase}
            style={getStyles()}
            onMouseDown={handleMouseDown}
        >
            {/* Hidden Audio Element (always present for audio types) */}
            {!isVideo && <audio ref={audioRef} />}

            {playerMode === 'pip' ? (
                // --- PiP Layout ---
                <div className="relative w-full h-full group">
                    {isVideo ? (
                        <video ref={videoRef} className="w-full h-full object-cover pointer-events-none" muted={false} playsInline />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-pink-900 pointer-events-none">
                            <img
                                src={currentMedia.logo || currentMedia.image}
                                className="w-16 h-16 rounded-lg shadow-lg object-cover"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                            <Music className="absolute w-12 h-12 text-white/20" />
                        </div>
                    )}

                    {/* PiP Controls Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button onClick={(e) => { e.stopPropagation(); setPlayerMode('mini'); }} className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30">
                            <Minimize2 className="w-5 h-5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); togglePlayPause(); }} className="p-3 bg-white rounded-full text-black hover:scale-105 transition-transform">
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleExpand(); }} className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30">
                            <Maximize2 className="w-5 h-5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); stopMedia(); }} className="p-2 bg-red-500/20 rounded-full text-red-400 hover:bg-red-500/30">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ) : (
                // --- Mini Player Layout ---
                <div className="w-full h-full flex items-center px-4 gap-4 bg-gray-900/95 backdrop-blur-xl">
                    {/* Thumbnail */}
                    <div
                        className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-800 cursor-pointer hover:scale-105 transition-transform flex-shrink-0"
                        onClick={handleExpand}
                    >
                        {isVideo ? (
                            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                        ) : (
                            <img
                                src={currentMedia.logo || currentMedia.image || '/placeholder.svg'}
                                className="w-full h-full object-cover"
                                onError={(e) => e.target.src = '/placeholder.svg'}
                            />
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={handleExpand}>
                        <h3 className="font-semibold text-white truncate text-sm hover:text-pink-400 transition-colors">
                            {currentMedia.name}
                        </h3>
                        <p className="text-xs text-gray-400 truncate">
                            {currentMedia.genre || 'Live Stream'}
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); togglePlayPause(); }} className="p-2 bg-pink-500 hover:bg-pink-600 rounded-full text-white shadow-lg hover:scale-105 transition-all">
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                        </button>

                        <button onClick={(e) => { e.stopPropagation(); setPlayerMode('pip'); }} className="hidden lg:block p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                            <Minimize2 className="w-5 h-5" />
                        </button>

                        <button onClick={(e) => { e.stopPropagation(); stopMedia(); }} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnifiedPlayer;
