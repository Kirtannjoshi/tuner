import React, { useState, useEffect, useRef } from 'react';
import {
    Play, Pause, Volume2, VolumeX, Maximize2, Minimize2,
    SkipBack, SkipForward, Settings, ChevronLeft, Music, Film
} from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';

/**
 * TunerPlayer - Professional Media Player
 * Combines: VLC + Netflix + YouTube + Twitch
 * Features: HLS streaming, quality selection, keyboard controls
 */
const TunerPlayer = ({ media, onClose }) => {
    const videoRef = useRef(null);
    const audioRef = useRef(null);
    const hlsRef = useRef(null);

    const {
        isPlaying, setIsPlaying,
        volume, setPlayerVolume,
        playerMode, setPlayerMode
    } = usePlayer();

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [showControls, setShowControls] = useState(true);

    const isVideo = media.type === 'tv';
    const isAudio = media.type === 'radio';
    const mediaElement = isVideo ? videoRef.current : audioRef.current;

    // Initialize player
    useEffect(() => {
        const element = isVideo ? videoRef.current : audioRef.current;
        if (!element) return;

        const streamUrl = media.streamUrl || media.url;
        if (!streamUrl) {
            setHasError(true);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setHasError(false);

        // Check if HLS stream
        if (streamUrl.includes('.m3u8')) {
            if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({
                    maxBufferLength: 5,
                    maxMaxBufferLength: 10,
                    lowLatencyMode: true,
                    enableWorker: true,
                    startLevel: -1, // Auto quality
                    debug: false,
                });

                hlsRef.current = hls;
                hls.loadSource(streamUrl);
                hls.attachMedia(element);

                hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
                    setIsLoading(false);
                    if (isPlaying) {
                        element.play().catch((err) => {
                            console.error('Play error:', err);
                            setIsPlaying(false);
                        });
                    }
                });

                hls.on(window.Hls.Events.ERROR, (event, data) => {
                    console.error('HLS Error:', data);
                    if (data.fatal) {
                        switch (data.type) {
                            case window.Hls.ErrorTypes.NETWORK_ERROR:
                                console.log('Network error, trying to recover...');
                                hls.startLoad();
                                break;
                            case window.Hls.ErrorTypes.MEDIA_ERROR:
                                console.log('Media error, trying to recover...');
                                hls.recoverMediaError();
                                break;
                            default:
                                setHasError(true);
                                setIsLoading(false);
                                break;
                        }
                    }
                });
            } else if (element.canPlayType('application/vnd.apple.mpegurl')) {
                // Native HLS support (Safari, iOS)
                element.src = streamUrl;
                element.onloadeddata = () => {
                    setIsLoading(false);
                    if (isPlaying) {
                        element.play().catch((err) => {
                            console.error('Play error:', err);
                            setIsPlaying(false);
                        });
                    }
                };
                element.onerror = () => {
                    setHasError(true);
                    setIsLoading(false);
                };
                element.load();
            } else {
                // HLS not supported
                console.error('HLS not supported in this browser');
                setHasError(true);
                setIsLoading(false);
            }
        } else {
            // Direct stream (MP3, AAC, etc.)
            element.src = streamUrl;
            element.onloadeddata = () => {
                setIsLoading(false);
                if (isPlaying) {
                    element.play().catch((err) => {
                        console.error('Play error:', err);
                        setIsPlaying(false);
                    });
                }
            };
            element.onerror = () => {
                setHasError(true);
                setIsLoading(false);
            };
            element.load();
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            if (element) {
                element.pause();
                element.src = '';
            }
        };
    }, [media.id]);

    // Playback control
    useEffect(() => {
        const element = isVideo ? videoRef.current : audioRef.current;
        if (!element) return;

        if (isPlaying) {
            element.play().catch(() => setIsPlaying(false));
        } else {
            element.pause();
        }
    }, [isPlaying]);

    // Volume control
    useEffect(() => {
        const element = isVideo ? videoRef.current : audioRef.current;
        if (element) element.volume = volume;
    }, [volume]);

    // Time tracking
    useEffect(() => {
        const element = isVideo ? videoRef.current : audioRef.current;
        if (!element) return;

        const updateTime = () => {
            setCurrentTime(element.currentTime);
            setDuration(element.duration);
        };

        element.addEventListener('timeupdate', updateTime);
        return () => element.removeEventListener('timeupdate', updateTime);
    }, [isVideo, isAudio]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKey = (e) => {
            if (e.target.tagName === 'INPUT') return;

            switch (e.key) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    setIsPlaying(!isPlaying);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    skip(-10);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    skip(10);
                    break;
                case 'm':
                    setPlayerVolume(volume === 0 ? 0.8 : 0);
                    break;
            }
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isPlaying, volume]);

    const skip = (seconds) => {
        const element = isVideo ? videoRef.current : audioRef.current;
        if (element) {
            element.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
        }
    };

    const seek = (time) => {
        const element = isVideo ? videoRef.current : audioRef.current;
        if (element) element.currentTime = time;
    };

    const formatTime = (seconds) => {
        if (!isFinite(seconds)) return 'LIVE';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // PiP Mode
    if (playerMode === 'pip') {
        return (
            <div className="fixed bottom-20 right-4 w-80 h-48 bg-black rounded-lg shadow-2xl z-50 group">
                {isVideo ? (
                    <video ref={videoRef} className="w-full h-full rounded-lg" playsInline />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-pink-900 rounded-lg">
                        <audio ref={audioRef} />
                        <Music className="w-16 h-16 text-white/30" />
                    </div>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 rounded-lg">
                    <button onClick={() => setPlayerMode('mini')} className="p-2 bg-white/20 rounded-full text-white" title="Minimize">
                        <Minimize2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 bg-white rounded-full">
                        {isPlaying ? <Pause className="w-5 h-5 text-black" /> : <Play className="w-5 h-5 text-black" />}
                    </button>
                    <button onClick={() => setPlayerMode('full')} className="p-2 bg-white/20 rounded-full text-white" title="Maximize">
                        <Maximize2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    // Full Player
    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col" onMouseMove={() => setShowControls(true)}>
            {/* Video/Audio Container */}
            <div className="flex-1 relative">
                {/* Back Button */}
                <button
                    onClick={() => setPlayerMode('mini')}
                    className="absolute top-4 left-4 z-50 p-2 bg-black/70 rounded-full text-white hover:bg-black/90"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Media Element */}
                {isVideo ? (
                    <video
                        ref={videoRef}
                        className="w-full h-full object-contain"
                        playsInline
                        poster={media.logo || media.image}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-pink-900 to-red-900">
                        <audio ref={audioRef} />
                        <img
                            src={media.logo || media.image || '/placeholder.svg'}
                            className="w-64 h-64 rounded-2xl shadow-2xl object-cover mb-6"
                            alt={media.name}
                        />
                        <h1 className="text-3xl font-bold">{media.name}</h1>
                        <p className="text-gray-300 text-lg mt-2">{media.genre}</p>
                    </div>
                )}

                {/* Loading */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {/* Error */}
                {hasError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/90">
                        <div className="text-center">
                            <p className="text-red-500 font-bold text-xl mb-4">Stream Unavailable</p>
                            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full">
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* Controls */}
                <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                    {/* Progress Bar */}
                    <div
                        className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-4 hover:h-2 transition-all"
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const pos = (e.clientX - rect.left) / rect.width;
                            seek(pos * duration);
                        }}
                    >
                        <div
                            className="h-full bg-pink-500 rounded-full relative"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg" />
                        </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => skip(-10)} className="text-white/80 hover:text-white">
                                <SkipBack className="w-6 h-6" />
                            </button>

                            <button onClick={() => setIsPlaying(!isPlaying)} className="p-3 bg-white rounded-full hover:scale-110 transition-transform">
                                {isPlaying ? <Pause className="w-7 h-7 text-black" /> : <Play className="w-7 h-7 text-black ml-0.5" />}
                            </button>

                            <button onClick={() => skip(10)} className="text-white/80 hover:text-white">
                                <SkipForward className="w-6 h-6" />
                            </button>

                            <div className="flex items-center gap-3 ml-4">
                                <button onClick={() => setPlayerVolume(volume === 0 ? 0.8 : 0)} className="text-white/80 hover:text-white">
                                    {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={volume}
                                    onChange={(e) => setPlayerVolume(parseFloat(e.target.value))}
                                    className="w-24 accent-pink-500"
                                />
                            </div>

                            <span className="text-sm text-white/70 ml-2">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={() => setPlayerMode('pip')} className="p-2 hover:bg-white/10 rounded-lg text-white">
                                <Minimize2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Bar */}
            <div className="bg-black/95 p-4 border-t border-white/10">
                <h2 className="text-xl font-bold">{media.name}</h2>
                <p className="text-gray-400 text-sm">{media.genre} • {media.country}</p>
            </div>
        </div>
    );
};

export default TunerPlayer;
