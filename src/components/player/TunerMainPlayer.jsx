import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Hls from 'hls.js';
import {
    Play, Pause, Volume2, VolumeX, Maximize2, Minimize2,
    ChevronLeft, Music, Film, Heart, Share2, MoreVertical,
    Maximize, Users, Radio as RadioIcon, Minimize, ChevronDown,
    PictureInPicture, ThumbsUp, ThumbsDown, AlertCircle, RefreshCw
} from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';
import { getRecommendations } from '../../services/recommendationEngine';
import { likeChannel, dislikeChannel, reportChannel, getChannelFeedbackById } from '../../services/channelFeedbackService';
import { getAllChannels } from '../../services/tvService';

const TunerMainPlayer = () => {
    const { type, id } = useParams();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const audioRef = useRef(null);
    const hlsRef = useRef(null);
    const loadingTimeoutRef = useRef(null);
    const retryTimeoutRef = useRef(null);

    const {
        currentMedia,
        isPlaying,
        setIsPlaying,
        volume,
        setPlayerVolume,
        setPlayerMode,
        playTv,
        playRadio,
        getRecentMedia
    } = usePlayer();

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [showControls, setShowControls] = useState(true);
    const [isTheaterMode, setIsTheaterMode] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [channelFeedback, setChannelFeedback] = useState({ likes: 0, dislikes: 0, reports: 0 });
    const [userLiked, setUserLiked] = useState(false);
    const [userDisliked, setUserDisliked] = useState(false);
    const [retryTrigger, setRetryTrigger] = useState(0); // Used to force re-init

    // Handle direct URL access (restore context if missing)
    useEffect(() => {
        if (!currentMedia && id && type) {
            // 1. Try to find in recent media (history) first - covers IPTV and Radio
            const recent = getRecentMedia();
            const foundInHistory = recent.find(item => String(item.id) === String(id));

            if (foundInHistory) {
                console.log('Restoring from history:', foundInHistory.name);
                if (type === 'tv') playTv(foundInHistory);
                else playRadio(foundInHistory);
                return;
            }

            // 2. Fallback to curated list for TV
            if (type === 'tv') {
                const channels = getAllChannels();
                const channel = channels.find(c => String(c.id) === String(id));
                if (channel) {
                    console.log('Restoring from curated:', channel.name);
                    playTv(channel);
                }
            }
        }
    }, [id, type, currentMedia, playTv, playRadio, getRecentMedia]);

    const isVideo = currentMedia?.type === 'tv';

    // Load channel feedback
    useEffect(() => {
        if (currentMedia) {
            const feedback = getChannelFeedbackById(currentMedia.id);
            setChannelFeedback(feedback);
        }
    }, [currentMedia?.id]);

    // Load Smart Recommendations
    useEffect(() => {
        const loadRecommendations = async () => {
            try {
                const recs = await getRecommendations(currentMedia, {
                    limit: 10,
                    includeIPTV: true,
                    userHistory: []
                });
                setRecommendations(recs);
            } catch (error) {
                console.error('Failed to load recommendations:', error);
            }
        };

        if (currentMedia) {
            loadRecommendations();
        }
    }, [currentMedia?.id]);

    const handleRetry = useCallback(() => {
        console.log('🔄 Retrying stream connection...');
        setHasError(false);
        setErrorMsg('');
        setIsLoading(true);
        setRetryTrigger(prev => prev + 1);
    }, []);

    // Initialize player
    useEffect(() => {
        if (!currentMedia) return;

        const element = isVideo ? videoRef.current : audioRef.current;
        if (!element) return;

        const streamUrl = currentMedia.streamUrl || currentMedia.url;
        if (!streamUrl) {
            setHasError(true);
            setErrorMsg('No stream URL available');
            setIsLoading(false);
            return;
        }

        // Check for Mixed Content (HTTP stream on HTTPS site)
        if (window.location.protocol === 'https:' && streamUrl.startsWith('http:')) {
            console.warn('Mixed content detected:', streamUrl);
        }

        setIsLoading(true);
        setHasError(false);
        setErrorMsg('');

        // Clear previous timeouts
        if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
        if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);

        // Set new timeout for stuck loading (30s - relaxed)
        loadingTimeoutRef.current = setTimeout(() => {
            if (isLoading) {
                console.warn('Stream loading timed out');
                setHasError(true);
                setErrorMsg('Connection timed out. The stream might be offline or very slow.');
                setIsLoading(false);
            }
        }, 30000);

        if (streamUrl.includes('.m3u8') || (isVideo && Hls.isSupported())) {
            if (Hls.isSupported()) {
                const hls = new Hls({
                    // Optimized for faster start and stability
                    maxBufferLength: 30,
                    maxMaxBufferLength: 60,
                    maxBufferSize: 30 * 1000 * 1000,
                    maxBufferHole: 0.5,

                    // Loading & Latency
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 30,

                    // Faster startup settings
                    startLevel: -1, // Auto
                    startFragPrefetch: true,

                    // Network Resilience - More aggressive retries
                    manifestLoadingTimeOut: 20000,
                    manifestLoadingMaxRetry: 5,
                    levelLoadingTimeOut: 20000,
                    levelLoadingMaxRetry: 5,
                    fragLoadingTimeOut: 25000,
                    fragLoadingMaxRetry: 6,

                    // ABR
                    abrEwmaDefaultEstimate: 1000000,
                    abrBandWidthFactor: 0.9,

                    debug: false,
                });

                hlsRef.current = hls;
                hls.loadSource(streamUrl);
                hls.attachMedia(element);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    console.log('✅ Stream ready');
                    setIsLoading(false);
                    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);

                    if (isPlaying) {
                        element.play().catch((err) => {
                            console.error('Play error:', err);
                            setIsLoading(false);
                            setIsPlaying(false);
                        });
                    }
                });

                hls.on(Hls.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        console.error('❌ Fatal HLS Error:', data.type, data.details);
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                console.log('🔄 Network error, attempting to recover...');
                                hls.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                console.log('🔄 Media error, recovering...');
                                hls.recoverMediaError();
                                break;
                            default:
                                console.error('💥 Unrecoverable error');
                                setHasError(true);
                                setErrorMsg('Stream format not supported or corrupted.');
                                setIsLoading(false);
                                if (hlsRef.current) hlsRef.current.destroy();
                                break;
                        }
                    }
                });

                hls.on(Hls.Events.FRAG_LOADED, () => {
                    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
                    setIsLoading(false);
                });

            } else if (element.canPlayType('application/vnd.apple.mpegurl')) {
                element.src = streamUrl;
                element.onloadedmetadata = () => {
                    setIsLoading(false);
                    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
                };
                element.onloadeddata = () => {
                    setIsLoading(false);
                    if (isPlaying) element.play().catch((err) => {
                        console.error('Play error:', err);
                        setIsLoading(false);
                        setIsPlaying(false);
                    });
                };
                element.onerror = () => {
                    setHasError(true);
                    setErrorMsg('Stream failed to load (Native Player).');
                    setIsLoading(false);
                };
                element.load();
            }
        } else {
            element.src = streamUrl;
            element.onloadedmetadata = () => {
                setIsLoading(false);
                if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
            };
            element.onloadeddata = () => {
                setIsLoading(false);
                if (isPlaying) element.play().catch((err) => {
                    console.error('Play error:', err);
                    setIsLoading(false);
                    setIsPlaying(false);
                });
            };
            element.onerror = () => {
                setHasError(true);
                setErrorMsg('Stream failed to load.');
                setIsLoading(false);
            };
            element.load();
        }

        // Native Event Listeners
        const onWaiting = () => setIsLoading(true);
        const onPlaying = () => {
            setIsLoading(false);
            if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
        };
        const onCanPlay = () => setIsLoading(false);

        element.addEventListener('waiting', onWaiting);
        element.addEventListener('playing', onPlaying);
        element.addEventListener('canplay', onCanPlay);

        return () => {
            if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
            if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            if (element) {
                element.removeEventListener('waiting', onWaiting);
                element.removeEventListener('playing', onPlaying);
                element.removeEventListener('canplay', onCanPlay);
                element.pause();
                element.src = '';
            }
        };
    }, [currentMedia?.id, currentMedia?.streamUrl, currentMedia?.url, isVideo, isPlaying, retryTrigger]);

    // Playback control
    useEffect(() => {
        const element = isVideo ? videoRef.current : audioRef.current;
        if (!element) return;

        if (isPlaying) {
            const playPromise = element.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error("Playback failed:", error);
                    setIsPlaying(false);
                });
            }
        } else {
            element.pause();
        }
    }, [isPlaying, isVideo]);

    // Volume control
    useEffect(() => {
        const element = isVideo ? videoRef.current : audioRef.current;
        if (element) element.volume = volume;
    }, [volume, isVideo]);

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
    }, [isVideo]);

    const formatTime = (seconds) => {
        if (!isFinite(seconds)) return 'LIVE';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const seek = (time) => {
        const element = isVideo ? videoRef.current : audioRef.current;
        if (element) element.currentTime = time;
    };

    const handleFullscreen = () => {
        const element = isVideo ? videoRef.current : null;
        if (element) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                element.requestFullscreen();
            }
        }
    };

    const handlePIP = async () => {
        if (isVideo && videoRef.current) {
            try {
                if (document.pictureInPictureElement) {
                    await document.exitPictureInPicture();
                } else {
                    await videoRef.current.requestPictureInPicture();
                }
            } catch (err) {
                console.error('PiP failed:', err);
            }
        } else {
            setPlayerMode('pip');
        }
    };

    const handleMinimize = () => {
        if (isVideo) {
            setPlayerMode('pip');
        } else {
            setPlayerMode('mini');
        }
        navigate(-1);
    };

    const handleRecommendationClick = (item) => {
        // Instantly switch context before navigation
        if (isVideo) {
            playTv(item);
        } else {
            playRadio(item);
        }
        navigate(`/watch/${isVideo ? 'tv' : 'radio'}/${item.id}`);
    };

    const handleLike = () => {
        if (!currentMedia) return;
        likeChannel(currentMedia.id);
        setUserLiked(true);
        setUserDisliked(false);
        setChannelFeedback(prev => ({ ...prev, likes: prev.likes + 1 }));
    };

    const handleDislike = () => {
        if (!currentMedia) return;
        dislikeChannel(currentMedia.id);
        setUserDisliked(true);
        setUserLiked(false);
        setChannelFeedback(prev => ({ ...prev, dislikes: prev.dislikes + 1 }));
    };

    const handleReport = () => {
        if (!currentMedia) return;
        const reason = prompt('Why is this channel not working?\n(e.g., "No video", "Audio only", "Buffering", "Offline")');
        if (reason) {
            reportChannel(currentMedia.id, reason);
            setChannelFeedback(prev => ({ ...prev, reports: prev.reports + 1 }));
            alert('Thank you for your feedback! This helps improve recommendations.');
        }
    };

    if (!currentMedia) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
                <div className="text-center">
                    <p className="text-xl mb-4">No media selected</p>
                    <button onClick={handleMinimize} className="px-6 py-3 bg-pink-500 hover:bg-pink-600 rounded-lg">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="lg:hidden p-4 border-b border-gray-800">
                <button onClick={handleMinimize} className="flex items-center gap-2 text-gray-400 hover:text-white">
                    <ChevronLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 w-full">
                <div className={`flex-1 ${isTheaterMode ? 'w-full' : 'lg:w-2/3'}`}>
                    <div className="relative bg-black rounded-xl overflow-hidden group" style={{ aspectRatio: '16/9' }}
                        onMouseMove={() => setShowControls(true)} onMouseLeave={() => setShowControls(false)}>
                        {isVideo ? (
                            <video ref={videoRef} className="w-full h-full object-contain" playsInline
                                poster={currentMedia.logo || currentMedia.image} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-900 to-red-900">
                                <audio ref={audioRef} />
                                <img src={currentMedia.logo || currentMedia.image || '/placeholder.svg'}
                                    className="w-64 h-64 rounded-2xl shadow-2xl object-cover" alt={currentMedia.name} />
                            </div>
                        )}

                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
                                    <p className="text-white/70 text-sm animate-pulse">Accessing Stream...</p>
                                </div>
                            </div>
                        )}

                        {hasError && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/90">
                                <div className="text-center px-4">
                                    <p className="text-red-500 font-bold text-xl mb-2">Stream Unavailable</p>
                                    <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                                        {errorMsg || 'The channel might be offline, geoblocked, or using an unsupported format.'}
                                    </p>
                                    <button onClick={handleRetry} className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full mx-auto transition-colors">
                                        <RefreshCw className="w-4 h-4" />
                                        Retry Connection
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                            {isFinite(duration) && duration > 0 ? (
                                <div className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-4 hover:h-2 transition-all"
                                    onClick={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const pos = (e.clientX - rect.left) / rect.width;
                                        seek(pos * duration);
                                    }}>
                                    <div className="h-full bg-pink-500 rounded-full relative" style={{ width: `${(currentTime / duration) * 100}%` }}>
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg" />
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-1.5 mb-4 flex items-center gap-2">
                                    <div className="h-1.5 flex-1 bg-red-600/50 rounded-full overflow-hidden">
                                        <div className="h-full w-full bg-red-600 animate-pulse" />
                                    </div>
                                    <span className="text-xs font-bold text-red-500 px-2 py-0.5 bg-red-500/10 rounded">LIVE</span>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 bg-white rounded-full hover:scale-110 transition-transform">
                                        {isPlaying ? <Pause className="w-6 h-6 text-black" /> : <Play className="w-6 h-6 text-black ml-0.5" />}
                                    </button>

                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setPlayerVolume(volume === 0 ? 0.8 : 0)} className="text-white/80 hover:text-white">
                                            {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                        </button>
                                        <input type="range" min="0" max="1" step="0.01" value={volume}
                                            onChange={(e) => setPlayerVolume(parseFloat(e.target.value))} className="w-24 accent-pink-500" />
                                    </div>

                                    <span className="text-sm text-white/70">{formatTime(currentTime)} / {formatTime(duration)}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button onClick={handleMinimize} className="p-2 hover:bg-white/10 rounded-lg text-white" title="Minimize Player">
                                        <ChevronDown className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => setIsTheaterMode(!isTheaterMode)} className="p-2 hover:bg-white/10 rounded-lg text-white"
                                        title={isTheaterMode ? "Exit Theater Mode" : "Theater Mode"}>
                                        {isTheaterMode ? <Minimize2 className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                                    </button>
                                    {isVideo && (
                                        <button onClick={handlePIP} className="p-2 hover:bg-white/10 rounded-lg text-white" title="Picture-in-Picture">
                                            <PictureInPicture className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button onClick={handleFullscreen} className="p-2 hover:bg-white/10 rounded-lg text-white" title="Fullscreen">
                                        <Maximize2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-gray-800/50 rounded-xl">
                        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                            <div className="flex items-center gap-4 w-full lg:w-auto">
                                <img src={currentMedia.logo || currentMedia.image || '/placeholder.svg'}
                                    className="w-16 h-16 rounded-full object-cover flex-shrink-0" alt={currentMedia.name} />

                                <div className="flex-1 min-w-0">
                                    <h1 className="text-xl lg:text-2xl font-bold mb-1 lg:mb-2 truncate">{currentMedia.name}</h1>
                                    <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-400 flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3 h-3 lg:w-4 lg:h-4" />
                                            {channelFeedback.likes}
                                        </span>
                                        <span>•</span>
                                        <span className="truncate max-w-[100px]">{currentMedia.genre}</span>
                                        <span>•</span>
                                        <span className="truncate max-w-[100px]">{currentMedia.country}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between lg:justify-end gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                                <button onClick={handleLike} className={`p-3 rounded-full transition-all flex-shrink-0 ${userLiked ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`} title="Like this channel">
                                    <ThumbsUp className={`w-5 h-5 ${userLiked ? 'fill-current' : ''}`} />
                                </button>

                                <button onClick={handleDislike} className={`p-3 rounded-full transition-all flex-shrink-0 ${userDisliked ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`} title="Dislike this channel">
                                    <ThumbsDown className={`w-5 h-5 ${userDisliked ? 'fill-current' : ''}`} />
                                </button>

                                <button onClick={handleReport} className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full text-gray-300 flex-shrink-0" title="Report not working">
                                    <AlertCircle className="w-5 h-5" />
                                </button>

                                <button onClick={() => setIsFavorite(!isFavorite)} className={`p-3 rounded-full transition-all flex-shrink-0 ${isFavorite ? 'bg-pink-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                                </button>

                                <button className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full text-gray-300 flex-shrink-0">
                                    <Share2 className="w-5 h-5" />
                                </button>

                                <button className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full text-gray-300 flex-shrink-0">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-700">
                            <p className="text-gray-300 text-sm">
                                {currentMedia.description || 'Live streaming from ' + currentMedia.country}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {currentMedia.genre?.split(',').map((tag, i) => (
                                    <span key={i} className="px-3 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
                                        {tag.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {!isTheaterMode && (
                    <div className="lg:w-1/3">
                        <div className="sticky top-4">
                            <h2 className="text-lg font-bold mb-4">Smart Recommendations</h2>
                            <div className="space-y-3">
                                {recommendations.map((item) => (
                                    <div key={item.id} onClick={() => handleRecommendationClick(item)}
                                        className="flex gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-all">
                                        <div className="w-40 h-24 bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                                            {item.logo ? (
                                                <img src={item.logo} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                isVideo ? <Film className="w-8 h-8 text-gray-500" /> : <RadioIcon className="w-8 h-8 text-gray-500" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-sm mb-1 truncate">{item.name}</h3>
                                            <p className="text-xs text-gray-400 truncate">{item.genre} • {item.country}</p>
                                            <p className="text-xs text-gray-500 mt-1">Live</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TunerMainPlayer;
