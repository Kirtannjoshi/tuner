import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Search,
    Bell,
    User,
    Menu,
    X,
    Globe,
    Tv,
    Radio,
    Sparkles,
    Bot,
    Loader2,
    Map,
    Compass,
    Plus,
    Monitor,
    Signal,
    Maximize,
    Minimize,
    Volume2,
    VolumeX,
    Volume1,
    Cast,
    AlertCircle,
    Activity,
    Settings,
    Play,
    Pause,
    Subtitles,
    List,
    Share2,
    Info,
    MessageSquare,
    Database,
    Wifi,
    Check,
    ChevronRight,
    BarChart3,
    Zap
} from 'lucide-react';

// --- CONFIGURATION ---
const FEATURED_CHANNELS = [
    {
        id: 'redbull_tv',
        name: 'Red Bull TV',
        group: 'Sports',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Red_Bull_GmbH_logo.svg/1200px-Red_Bull_GmbH_logo.svg.png',
        url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
    },
    {
        id: 'nasa_public',
        name: 'NASA TV',
        group: 'Science',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/1200px-NASA_logo.svg.png',
        url: 'https://ntv1.akamaized.net/hls/live/2013530/NASA-Public/master.m3u8',
    },
    {
        id: 'dd_india',
        name: 'DD India',
        group: 'News',
        logo: 'https://upload.wikimedia.org/wikipedia/en/f/ff/DD_India_logo.svg',
        url: 'https://gumlet-s-livetv.voot.com/out/v1/247b232142e74953b635527955458987/index.m3u8',
    },
    {
        id: 'rakuten_action',
        name: 'Rakuten Action',
        group: 'Movies',
        logo: 'https://cdn-icons-png.flaticon.com/512/2503/2503508.png',
        url: 'https://rakuten-actionmovies-1-eu.rakuten.wurl.tv/playlist.m3u8',
    },
    {
        id: 'clubbing_tv',
        name: 'Clubbing TV',
        group: 'Music',
        logo: 'https://images.squarespace-cdn.com/content/v1/5d4c44d7f9955f000124d637/1565625437180-4R90F3P13Q4Z9Q4Z9Q4Z/ClubbingTV_Logo_Black.png',
        url: 'https://dai.google.com/linear/hls/event/S8C_gZz7Tp6tZgG4j6wV5A/master.m3u8',
    }
];

const PLAYLIST_SOURCES = [
    { name: "✨ Featured (Built-in)", url: "INTERNAL_FEATURED", count: "Selected" },
    { name: "🌐 IPTV-Org (Global)", url: "https://iptv-org.github.io/iptv/index.m3u", count: "10k+" },
    { name: "🇮🇳 India (IPTV-Org)", url: "https://iptv-org.github.io/iptv/countries/in.m3u", count: "300+" },
    { name: "🇺🇸 USA (IPTV-Org)", url: "https://iptv-org.github.io/iptv/countries/us.m3u", count: "1k+" },
    { name: "🇬🇧 UK (IPTV-Org)", url: "https://iptv-org.github.io/iptv/countries/uk.m3u", count: "400+" },
    { name: "📺 Samsung TV Plus", url: "https://i.mjh.nz/SamsungTVPlus/all.m3u8", count: "1k+" },
    { name: "🎬 Plex Free TV", url: "https://i.mjh.nz/Plex/all.m3u8", count: "300+" },
    { name: "🏆 Sports", url: "https://iptv-org.github.io/iptv/categories/sports.m3u", count: "500+" },
    { name: "🎵 Music", url: "https://iptv-org.github.io/iptv/categories/music.m3u", count: "300+" },
    { name: "🎞️ Movies", url: "https://iptv-org.github.io/iptv/categories/movies.m3u", count: "400+" },
];

// --- PARSER ---
const parseM3U = (content) => {
    const lines = content.split('\n');
    const result = [];
    let currentChannel = {};

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line.startsWith('#EXTINF:')) {
            const info = line.substring(8);
            const logoMatch = info.match(/tvg-logo="([^"]*)"/);
            const groupMatch = info.match(/group-title="([^"]*)"/);
            const nameParts = info.split(',');

            currentChannel = {
                id: Math.random().toString(36).substr(2, 9),
                name: nameParts[nameParts.length - 1].trim(),
                logo: logoMatch ? logoMatch[1] : 'https://cdn-icons-png.flaticon.com/512/4409/4409506.png',
                group: groupMatch ? groupMatch[1] : 'General',
            };
        } else if (line.startsWith('http')) {
            currentChannel.url = line;
            if (currentChannel.name && currentChannel.url) {
                result.push(currentChannel);
            }
            currentChannel = {};
        }
    }
    return result;
};

// --- COMPONENTS ---

const PlayerSettingsMenu = ({
    levels,
    currentLevel,
    onQualitySelect,
    latencyMode,
    onLatencyChange,
    stats,
    onClose
}) => {
    const [activeTab, setActiveTab] = useState('main'); // main, quality, stats

    // Render Main Menu
    if (activeTab === 'main') {
        return (
            <div className="absolute bottom-16 right-4 bg-[#1a1d26]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 w-64 z-50 animate-in slide-in-from-bottom-4 duration-200">
                <div className="flex items-center justify-between px-3 py-2 mb-1 border-b border-white/5">
                    <span className="text-sm font-bold text-white">Settings</span>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full"><X size={14} className="text-slate-400 hover:text-white" /></button>
                </div>
                <div className="space-y-1">
                    <button
                        onClick={() => setActiveTab('quality')}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-white/10 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Settings size={16} />
                            <span>Quality</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 text-xs">
                            <span>{currentLevel === -1 ? 'Auto' : `${levels[currentLevel]?.height}p`}</span>
                            <ChevronRight size={14} />
                        </div>
                    </button>

                    <button
                        onClick={() => onLatencyChange(latencyMode === 'low' ? 'smooth' : 'low')}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-white/10 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Zap size={16} />
                            <span>Latency Mode</span>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${latencyMode === 'low' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {latencyMode === 'low' ? 'Low Latency' : 'Smooth'}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('stats')}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-white/10 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <BarChart3 size={16} />
                            <span>Stats for Nerds</span>
                        </div>
                        <ChevronRight size={14} className="text-slate-400" />
                    </button>
                </div>
            </div>
        );
    }

    // Render Quality Submenu
    if (activeTab === 'quality') {
        return (
            <div className="absolute bottom-16 right-4 bg-[#1a1d26]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 w-64 z-50">
                <div className="flex items-center gap-2 px-3 py-2 mb-1 border-b border-white/5 cursor-pointer hover:text-white text-slate-300" onClick={() => setActiveTab('main')}>
                    <ChevronRight size={14} className="rotate-180" />
                    <span className="text-sm font-bold">Quality</span>
                </div>
                <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1">
                    <button
                        onClick={() => { onQualitySelect(-1); setActiveTab('main'); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex justify-between items-center ${currentLevel === -1 ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-white/10'}`}
                    >
                        <span>Auto (Recommended)</span>
                        {currentLevel === -1 && <Check size={14} />}
                    </button>
                    {levels.map((level, index) => (
                        <button
                            key={index}
                            onClick={() => { onQualitySelect(index); setActiveTab('main'); }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm flex justify-between items-center ${currentLevel === index ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-white/10'}`}
                        >
                            <span>{level.height}p <span className="opacity-50 ml-1 text-xs">({Math.round(level.bitrate / 1000)} Kbps)</span></span>
                            {currentLevel === index && <Check size={14} />}
                        </button>
                    ))}
                    {levels.length === 0 && (
                        <div className="px-3 py-4 text-center text-xs text-slate-500">
                            No quality options available for this stream.
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Render Stats Submenu
    if (activeTab === 'stats') {
        return (
            <div className="absolute bottom-16 right-4 bg-[#1a1d26]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 w-64 z-50 font-mono text-xs">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5 cursor-pointer hover:text-white text-slate-300" onClick={() => setActiveTab('main')}>
                    <ChevronRight size={14} className="rotate-180" />
                    <span className="font-bold font-sans">Connection Health</span>
                </div>
                <div className="space-y-2 text-slate-300">
                    <div className="flex justify-between">
                        <span className="opacity-50">Bandwidth:</span>
                        <span className="text-emerald-400">{stats.bandwidth ? (stats.bandwidth / 1000000).toFixed(2) + ' Mbps' : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="opacity-50">Buffer Length:</span>
                        <span className={stats.buffer < 2 ? "text-red-400" : "text-emerald-400"}>{stats.buffer?.toFixed(2)} sec</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="opacity-50">Latency:</span>
                        <span className="text-blue-400">{latencyMode === 'low' ? 'Ultra Low' : 'Standard'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="opacity-50">Dropped Frames:</span>
                        <span className="text-yellow-400">{stats.droppedFrames || 0}</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

const PlayerControls = ({
    playing,
    muted,
    volume,
    isLive,
    onPlayPause,
    onMute,
    onVolumeChange,
    onFullscreen,
    onSettingsToggle,
    onToggleSubtitles,
    hasSubtitles,
    subtitlesEnabled,
}) => {
    return (
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent px-6 pb-6 pt-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-3 z-40">

            {/* Progress Bar (Visual for Live) */}
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer group/progress">
                <div className="h-full bg-red-600 w-full relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full scale-0 group-hover/progress:scale-100 transition-transform shadow"></div>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button onClick={onPlayPause} className="text-white hover:text-emerald-400 transition-colors hover:scale-110 transform duration-200">
                        {playing ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
                    </button>

                    <div className="flex items-center gap-3 group/volume">
                        <button onClick={onMute} className="text-white hover:text-emerald-400 transition-colors">
                            {muted || volume === 0 ? <VolumeX size={24} /> : volume < 0.5 ? <Volume1 size={24} /> : <Volume2 size={24} />}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={muted ? 0 : volume}
                            onChange={onVolumeChange}
                            className="w-0 group-hover/volume:w-24 transition-all duration-300 h-1 bg-white/50 hover:bg-emerald-500 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-red-500 uppercase tracking-wider">
                            {isLive ? "LIVE" : "DVR"}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-white">
                    {hasSubtitles && (
                        <button
                            onClick={onToggleSubtitles}
                            className={`p-1.5 rounded hover:bg-white/20 transition ${subtitlesEnabled ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-300'}`}
                            title="Subtitles/CC"
                        >
                            <Subtitles size={22} />
                        </button>
                    )}
                    <button onClick={onSettingsToggle} className="hover:text-emerald-400 hover:rotate-90 transition-all duration-300" title="Settings">
                        <Settings size={22} />
                    </button>
                    <button onClick={onFullscreen} className="hover:text-emerald-400 hover:scale-110 transition-transform" title="Fullscreen">
                        <Maximize size={22} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const IptvPlayer = ({ channel, isRetro, muted, volume, onToggleMute, onVolumeChange }) => {
    const containerRef = useRef(null);
    const videoRef = useRef(null);
    const hlsRef = useRef(null);

    // Player State
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [hasSubtitles, setHasSubtitles] = useState(false);
    const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Advanced Settings State
    const [qualityLevels, setQualityLevels] = useState([]);
    const [currentQuality, setCurrentQuality] = useState(-1);
    const [latencyMode, setLatencyMode] = useState('smooth'); // 'low' or 'smooth'
    const [showSettings, setShowSettings] = useState(false);
    const [stats, setStats] = useState({ bandwidth: 0, buffer: 0, droppedFrames: 0 });

    // --- Channel Switch Effect ---
    useEffect(() => {
        setIsTransitioning(true);
        setHasError(false);
        setIsLoading(true);
        setQualityLevels([]);
        setCurrentQuality(-1);

        const timer = setTimeout(() => setIsTransitioning(false), 800);
        return () => clearTimeout(timer);
    }, [channel.id]);

    // --- HLS Logic ---
    useEffect(() => {
        if (hlsRef.current) hlsRef.current.destroy();
        const video = videoRef.current;
        if (!video) return;

        const initHls = () => {
            if (window.Hls && window.Hls.isSupported()) {
                const config = {
                    enableWorker: true,
                    // Latency Config based on Mode
                    liveSyncDurationCount: latencyMode === 'low' ? 2 : 3,
                    liveMaxLatencyDurationCount: latencyMode === 'low' ? 3 : 5,
                    maxBufferLength: latencyMode === 'low' ? 10 : 60,
                    backBufferLength: latencyMode === 'low' ? 10 : 60,
                    startFragPrefetch: true,
                };

                const hls = new window.Hls(config);
                hlsRef.current = hls;
                hls.loadSource(channel.url);
                hls.attachMedia(video);

                hls.on(window.Hls.Events.MANIFEST_PARSED, (event, data) => {
                    setIsLoading(false);
                    setQualityLevels(hls.levels);
                    video.play().catch(() => setIsPlaying(false));
                });

                hls.on(window.Hls.Events.LEVEL_SWITCHED, (event, data) => {
                    // Optional: Update UI to show auto-selected level
                });

                hls.on(window.Hls.Events.SUBTITLE_TRACKS_UPDATED, (event, data) => {
                    if (data.subtitleTracks.length > 0) setHasSubtitles(true);
                });

                // Stats Gathering
                hls.on(window.Hls.Events.FRAG_LOADED, (event, data) => {
                    setStats(prev => ({
                        ...prev,
                        bandwidth: data.stats.bwEstimate,
                    }));
                });

                // Interval for buffer checking
                const statsInterval = setInterval(() => {
                    if (video) {
                        let buffer = 0;
                        if (video.buffered.length > 0) {
                            buffer = video.buffered.end(video.buffered.length - 1) - video.currentTime;
                        }
                        setStats(prev => ({ ...prev, buffer }));
                    }
                }, 1000);

                hls.on(window.Hls.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else {
                            setHasError(true);
                            setIsLoading(false);
                        }
                    }
                });

                return () => clearInterval(statsInterval);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = channel.url;
                video.addEventListener('loadedmetadata', () => setIsLoading(false));
                video.addEventListener('error', () => setHasError(true));
            }
        };

        initHls();
        return () => { if (hlsRef.current) hlsRef.current.destroy(); };
    }, [channel.url, latencyMode]); // Re-init if latency mode changes

    // --- Audio Sync ---
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = muted;
            videoRef.current.volume = volume;
        }
    }, [muted, volume]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => console.log(err));
        } else {
            document.exitFullscreen();
        }
    };

    const toggleSubtitles = () => {
        if (!hlsRef.current) return;
        const newStatus = !subtitlesEnabled;
        setSubtitlesEnabled(newStatus);
        hlsRef.current.subtitleTrack = newStatus ? 0 : -1;
    };

    const changeQuality = (levelIndex) => {
        if (!hlsRef.current) return;
        hlsRef.current.currentLevel = levelIndex;
        setCurrentQuality(levelIndex);
    };

    return (
        <div
            ref={containerRef}
            className={`w-full h-full bg-black relative group overflow-hidden shadow-2xl flex items-center justify-center ${isRetro ? 'rounded-[3rem] border-4 border-gray-800' : ''}`}
        >
            {/* --- CINEMATIC BLUR BG --- */}
            <div className="absolute inset-0 z-0 overflow-hidden opacity-30 blur-3xl scale-110">
                <img
                    src={channel.logo || "https://via.placeholder.com/150"}
                    className="w-full h-full object-cover"
                    alt=""
                />
                <div className="absolute inset-0 bg-black/50"></div>
            </div>

            {/* --- ODETTE SWITCH EFFECT --- */}
            <div className={`absolute inset-0 z-50 bg-[url('https://media.giphy.com/media/oEI9uBYSzLpBK/giphy.gif')] bg-cover pointer-events-none transition-opacity duration-300 ${isTransitioning ? 'opacity-100' : 'opacity-0'}`}></div>
            <div className={`absolute inset-0 z-50 bg-black transition-all duration-500 ease-out ${isTransitioning ? 'scale-y-0' : 'scale-y-0 opacity-0'}`}></div>
            {isTransitioning && <div className="absolute z-50 w-full h-[2px] bg-white/80 top-1/2 shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-pulse"></div>}

            {/* --- STATES --- */}
            {isLoading && !hasError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                    <Loader2 size={56} className="text-emerald-500 animate-spin mb-4 drop-shadow-lg" />
                    <p className="text-white/90 font-mono text-xs tracking-[0.3em] animate-pulse bg-black/50 px-4 py-1 rounded-full border border-white/10">ESTABLISHING LINK...</p>
                </div>
            )}

            {hasError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/90">
                    <AlertCircle size={56} className="text-red-500 mb-4 animate-bounce" />
                    <p className="text-white font-mono text-sm uppercase tracking-widest mb-6">SIGNAL LOST</p>
                    <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold text-white border border-white/10 transition-all">
                        RE-SCAN
                    </button>
                </div>
            )}

            {/* --- VIDEO --- */}
            <video
                ref={videoRef}
                className={`relative z-10 max-w-full max-h-full aspect-video shadow-2xl ${isRetro ? 'scale-105 contrast-125 brightness-90 sepia-[0.2] rounded-[2rem]' : ''}`}
                playsInline
                onClick={togglePlay}
            />

            {/* --- RETRO OVERLAYS --- */}
            {isRetro && (
                <div className="absolute inset-0 pointer-events-none z-30 rounded-[3rem] overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0)_60%,rgba(0,0,0,0.4)_100%)]"></div>
                </div>
            )}

            {/* --- SETTINGS MENU --- */}
            {showSettings && (
                <PlayerSettingsMenu
                    levels={qualityLevels}
                    currentLevel={currentQuality}
                    onQualitySelect={changeQuality}
                    latencyMode={latencyMode}
                    onLatencyChange={setLatencyMode}
                    stats={stats}
                    onClose={() => setShowSettings(false)}
                />
            )}

            {/* --- CONTROLS --- */}
            <PlayerControls
                playing={isPlaying}
                muted={muted}
                volume={volume}
                isLive={true}
                onPlayPause={togglePlay}
                onMute={onToggleMute}
                onVolumeChange={onVolumeChange}
                onFullscreen={toggleFullscreen}
                onSettingsToggle={() => setShowSettings(!showSettings)}
                onToggleSubtitles={toggleSubtitles}
                hasSubtitles={hasSubtitles}
                subtitlesEnabled={subtitlesEnabled}
            />
        </div>
    );
};

// --- SETTINGS MODAL (Global) ---
const SettingsModal = ({ isOpen, onClose, currentSource, onSourceChange, sources }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#1a1d26] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-white font-bold flex items-center gap-2"><Settings size={18} /> Satellite Configuration</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                    <div className="text-xs font-bold text-slate-500 uppercase px-2 py-2">Select Provider</div>
                    {sources.map((src) => (
                        <button
                            key={src.name}
                            onClick={() => onSourceChange(src)}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm flex justify-between items-center mb-1 transition-colors ${currentSource.name === src.name ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-white/5'}`}
                        >
                            <span className="font-medium">{src.name}</span>
                            <span className="text-xs opacity-60 bg-black/20 px-2 py-0.5 rounded-full">{src.count}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const callGeminiApi = async (prompt) => {
    return "Analyzing stream data...";
};

export default function LiveTvPage() {
    const [activeSource, setActiveSource] = useState(PLAYLIST_SOURCES[0]);
    const [channels, setChannels] = useState(FEATURED_CHANNELS);
    const [activeChannel, setActiveChannel] = useState(FEATURED_CHANNELS[0]);
    const [loadingSource, setLoadingSource] = useState(false);
    const [search, setSearch] = useState('');
    const [isRetroMode, setIsRetroMode] = useState(false);
    const [muted, setMuted] = useState(true);
    const [volume, setVolume] = useState(1);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [chatOpen, setChatOpen] = useState(true);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [chat, setChat] = useState([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        loadPlaylist(PLAYLIST_SOURCES[0]);
    }, []);

    const loadPlaylist = async (source) => {
        setActiveSource(source);
        setSettingsOpen(false);

        if (source.url === "INTERNAL_FEATURED") {
            setChannels(FEATURED_CHANNELS);
            setActiveChannel(FEATURED_CHANNELS[0]);
            return;
        }

        setLoadingSource(true);

        const fetchWithAllOrigins = async (url) => {
            const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
            if (!res.ok) throw new Error("Proxy Error");
            const data = await res.json();
            return data.contents;
        };

        const fetchWithCorsProxy = async (url) => {
            const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
            if (!res.ok) throw new Error("Cors Error");
            return await res.text();
        };

        let content = null;
        try {
            const res = await fetch(source.url);
            if (res.ok) {
                content = await res.text();
            } else {
                throw new Error("Direct fetch failed");
            }
        } catch (e1) {
            try {
                content = await fetchWithAllOrigins(source.url);
            } catch (e2) {
                try {
                    content = await fetchWithCorsProxy(source.url);
                } catch (e3) {
                    console.error("All fetch methods failed.");
                }
            }
        }

        if (content) {
            const parsedChannels = parseM3U(content);
            if (parsedChannels.length > 0) {
                setChannels(parsedChannels);
            } else {
                alert("No channels found.");
                setChannels(FEATURED_CHANNELS);
            }
        } else {
            if (channels.length === 0) setChannels(FEATURED_CHANNELS);
        }
        setLoadingSource(false);
    };

    const filteredChannels = useMemo(() => {
        const lowerSearch = search.toLowerCase();
        return channels.filter(c =>
            c.name.toLowerCase().includes(lowerSearch) ||
            (c.group && c.group.toLowerCase().includes(lowerSearch))
        ).slice(0, 200);
    }, [channels, search]);

    const handleChatSubmit = async () => {
        if (!input.trim()) return;
        setChat(p => [...p, { id: Date.now(), u: "You", t: input, c: "text-white" }]);
        const txt = input;
        setInput('');
        if (txt.toLowerCase().includes('@gemini')) {
            const response = await callGeminiApi(txt);
            setChat(p => [...p, { id: Date.now() + 1, u: "Gemini", t: response, c: "text-emerald-400", isBot: true }]);
        }
    };

    return (
        <div className={`flex flex-col h-screen ${isRetroMode ? 'bg-[#1a1818]' : 'bg-[#0f1117]'} font-sans text-slate-100 overflow-hidden transition-colors duration-500`}>

            <SettingsModal
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                currentSource={activeSource}
                onSourceChange={loadPlaylist}
                sources={PLAYLIST_SOURCES}
            />

            <header className={`h-16 ${isRetroMode ? 'bg-[#222] border-yellow-900/30' : 'bg-[#1a1d26] border-white/5'} border-b flex items-center justify-between px-4 shrink-0 z-30 relative shadow-md`}>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-emerald-400 cursor-pointer">
                        <div className="bg-emerald-500/10 p-2 rounded-lg">
                            <Activity size={24} />
                        </div>
                        <div className="hidden md:block">
                            <h1 className={`font-bold text-lg tracking-tight ${isRetroMode ? 'text-yellow-500 font-mono' : 'text-white'}`}>OPEN.STREAM</h1>
                        </div>
                    </div>
                </div>

                <div className="flex-1 max-w-2xl mx-4">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder={isRetroMode ? "TUNING..." : `Search ${channels.length} channels...`}
                            className={`w-full ${isRetroMode ? 'bg-[#111] border-yellow-900/50 text-yellow-500 font-mono' : 'bg-[#0f1117] border-white/10 text-slate-200'} border rounded-full py-2.5 pl-12 pr-4 text-sm outline-none transition-all focus:border-emerald-500/50 focus:bg-black`}
                            value={search}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className={`absolute left-4 top-3 ${isRetroMode ? 'text-yellow-800' : 'text-slate-500'} transition-colors`} size={18} />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => setSettingsOpen(true)} className="p-2 hover:bg-white/5 rounded-full text-slate-300 transition-colors" title="Settings">
                        <Settings size={20} />
                    </button>
                    <div className="h-6 w-px bg-white/10 mx-1"></div>
                    <button
                        onClick={() => setIsRetroMode(!isRetroMode)}
                        className={`p-2 rounded-lg transition-all ${isRetroMode ? 'text-yellow-500 bg-yellow-900/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        title="Retro Mode"
                    >
                        {isRetroMode ? <Monitor size={20} /> : <Tv size={20} />}
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">

                <aside className={`${sidebarOpen ? 'w-80' : 'w-0'} ${isRetroMode ? 'bg-[#151515] border-yellow-900/20' : 'bg-[#14161f] border-white/5'} border-r flex flex-col transition-all duration-300 shrink-0 z-20`}>
                    <div className={`px-4 py-3 flex justify-between items-center border-b ${isRetroMode ? 'border-yellow-900/20' : 'border-white/5'}`}>
                        <span className={`text-xs font-bold uppercase ${isRetroMode ? 'text-yellow-700' : 'text-slate-500'}`}>
                            {loadingSource ? 'DOWNLOADING...' : `${filteredChannels.length} STATIONS`}
                        </span>
                        <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white md:hidden"><X size={18} /></button>
                    </div>

                    {loadingSource ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2">
                            <Loader2 className="animate-spin" />
                            <span className="text-xs">Fetching Playlist...</span>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                            {filteredChannels.map(c => (
                                <div
                                    key={c.id}
                                    onClick={() => setActiveChannel(c)}
                                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer group transition-all ${activeChannel.id === c.id ? (isRetroMode ? 'bg-yellow-900/20 border border-yellow-700/50 text-yellow-500' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20') : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'}`}
                                >
                                    <div className="relative shrink-0 w-10 h-10 bg-black/30 rounded-md flex items-center justify-center overflow-hidden border border-white/5">
                                        <img src={c.logo} className="w-full h-full object-contain p-1" alt={c.name} onError={(e) => e.target.src = 'https://cdn-icons-png.flaticon.com/512/4409/4409506.png'} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-bold text-sm truncate leading-tight">{c.name}</h4>
                                        <span className="text-[10px] opacity-60 truncate block">{c.group}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </aside>

                <main className={`flex-1 flex flex-col ${isRetroMode ? 'bg-[#111] text-yellow-500' : 'bg-[#0f1117]'} overflow-y-auto min-w-0 relative transition-colors duration-700`}>

                    {!sidebarOpen && (
                        <button onClick={() => setSidebarOpen(true)} className="absolute top-4 left-4 z-30 p-2 bg-black/50 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                            <List size={20} />
                        </button>
                    )}

                    <div className="flex-1 flex flex-col w-full h-full">
                        <div className="flex-1 relative bg-black flex items-center justify-center">
                            <IptvPlayer
                                channel={activeChannel}
                                isRetro={isRetroMode}
                                muted={muted}
                                volume={volume}
                                onToggleMute={() => setMuted(!muted)}
                                onVolumeChange={(e) => setVolume(parseFloat(e.target.value))}
                            />
                        </div>

                        <div className={`p-4 border-t ${isRetroMode ? 'border-yellow-900/20 bg-[#151515]' : 'border-white/5 bg-[#14161f]'} flex justify-between items-center`}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/5 rounded-lg p-2 border border-white/10">
                                    <img src={activeChannel.logo} className="w-full h-full object-contain" alt="" onError={(e) => e.target.src = 'https://cdn-icons-png.flaticon.com/512/4409/4409506.png'} />
                                </div>
                                <div>
                                    <h1 className={`text-xl font-bold ${isRetroMode ? 'text-yellow-500' : 'text-white'}`}>{activeChannel.name}</h1>
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <span className="bg-white/10 px-2 py-0.5 rounded text-white/80">{activeChannel.group}</span>
                                        <span>•</span>
                                        <span className="font-mono opacity-50">LIVE BROADCAST</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setChatOpen(!chatOpen)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${chatOpen ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                                >
                                    <MessageSquare size={18} />
                                    <span className="hidden md:inline">Chat</span>
                                </button>
                                <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors">
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </main>

                {chatOpen && (
                    <aside className={`w-80 ${isRetroMode ? 'bg-[#151515] border-yellow-900/20' : 'bg-[#14161f] border-white/5'} border-l flex flex-col shrink-0 z-20`}>
                        <div className={`h-12 border-b flex items-center justify-between px-4 ${isRetroMode ? 'border-yellow-900/20' : 'border-white/5'}`}>
                            <span className="font-bold text-xs uppercase tracking-wider text-slate-500">Stream Chat</span>
                            <button onClick={() => setChatOpen(false)} className="text-slate-500 hover:text-white"><X size={18} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-black/20">
                            <div className="text-center text-xs text-slate-500 my-4">Welcome to the chat room!</div>
                            {chat.map(msg => (
                                <div key={msg.id} className="text-sm break-words animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <span className={`font-bold ${msg.c} mr-2 cursor-pointer hover:underline`}>{msg.u}:</span>
                                    <span className={isRetroMode ? 'text-yellow-600' : 'text-slate-300'}>{msg.t}</span>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-white/5 bg-[#1a1d26]">
                            <form onSubmit={(e) => { e.preventDefault(); handleChatSubmit(); }} className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Send a message..."
                                    className="w-full bg-black/50 border border-white/10 rounded-lg py-2.5 pl-3 pr-10 text-sm text-white outline-none focus:border-emerald-500 transition-colors"
                                />
                                <button type="submit" className="absolute right-2 top-2 p-1 text-emerald-500 hover:text-emerald-400">
                                    <Sparkles size={16} />
                                </button>
                            </form>
                        </div>
                    </aside>
                )}

            </div>
        </div>
    );
}
