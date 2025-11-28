import React, { useState, useEffect, useRef } from 'react';
import {
    Play, Pause, Heart, Search, Globe, X, Share2, Plus,
    Volume2, VolumeX, Settings, ThumbsUp, ThumbsDown,
    Clock, MoreVertical, ChevronLeft, ChevronDown, Loader,
    Headphones, Disc, Film, Sparkles, Zap
} from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import {
    searchArchive,
    searchPodcasts,
    getLanguageCategories,
    getTrendingAudio
} from '../services/audioService';
import UnifiedMediaIcon from '../components/common/UnifiedMediaIcon';

// --- PUBLIC DOMAIN VIDEO DATA ---
const VIDEO_ARCHIVE = [
    {
        id: 'sintel-2010',
        title: "Sintel",
        type: "Movie",
        mediaType: "video",
        thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Sintel_poster.jpg/640px-Sintel_poster.jpg",
        description: "A lonely young woman, Sintel, helps and befriends a dragon, whom she calls Scales. When he is kidnapped by an adult dragon, Sintel decides to embark on a dangerous quest to find her lost friend.",
        year: 2010,
        language: "English",
        tags: ["Fantasy", "Animation", "Open Source"],
        channel: "Blender Foundation",
        duration: "14:48",
        views: "12M views",
        streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
    },
    {
        id: 'tears-steel-2012',
        title: "Tears of Steel",
        type: "Movie",
        mediaType: "video",
        thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Tears_of_Steel_poster.jpg/640px-Tears_of_Steel_poster.jpg",
        description: "A group of warriors and scientists gather at the Oude Kerk in Amsterdam to stage a desperate event from the past in a desperate attempt to rescue the world from destructive robots.",
        year: 2012,
        language: "English",
        tags: ["Sci-Fi", "Action", "VFX"],
        channel: "Mango Project",
        duration: "12:14",
        views: "8.5M views",
        streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
    },
    {
        id: 'big-buck-bunny',
        title: "Big Buck Bunny",
        type: "Short",
        mediaType: "video",
        thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/640px-Big_buck_bunny_poster_big.jpg",
        description: "A large and lovable rabbit is harassed by three small rodents. The bunny decides to exact revenge.",
        year: 2008,
        language: "No Dialogue",
        tags: ["Comedy", "Animation", "Family"],
        channel: "Peach Project",
        duration: "09:56",
        views: "45M views",
        streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    },
    {
        id: 'elephants-dream',
        title: "Elephants Dream",
        type: "Short",
        mediaType: "video",
        thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Elephants_Dream_s5_both.jpg/640px-Elephants_Dream_s5_both.jpg",
        description: "The story of two strange characters exploring a capricious and seemingly infinite machine.",
        year: 2006,
        language: "English",
        tags: ["Surreal", "Animation", "Experimental"],
        channel: "Orange Open Movie",
        duration: "10:53",
        views: "6.2M views",
        streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
    },
    {
        id: 'night-living-dead',
        title: "Night of the Living Dead",
        type: "Movie",
        mediaType: "video",
        thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Night_of_the_Living_Dead_afiche.jpg/640px-Night_of_the_Living_Dead_afiche.jpg",
        description: "A ragtag group of Pennsylvanians barricade themselves in an old farmhouse to remain safe from a bloodthirsty, flesh-eating horde of ghouls.",
        year: 1968,
        language: "English",
        tags: ["Horror", "Classic", "Zombie"],
        channel: "George A. Romero",
        duration: "1:36:00",
        views: "25M views",
        streamUrl: "https://archive.org/download/night_of_the_living_dead/night_of_the_living_dead_512kb.mp4"
    },
    {
        id: 'charade-1963',
        title: "Charade",
        type: "Movie",
        mediaType: "video",
        thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Charade_poster.jpg/640px-Charade_poster.jpg",
        description: "Romance and suspense ensue in Paris as a woman is pursued by several men who want a fortune her murdered husband had stolen. Whom can she trust?",
        year: 1963,
        language: "English",
        tags: ["Thriller", "Romance", "Mystery"],
        channel: "Universal Pictures",
        duration: "1:53:00",
        views: "18M views",
        streamUrl: "https://archive.org/download/Charade_1963/Charade_1963_512kb.mp4"
    },
    {
        id: 'his-girl-friday',
        title: "His Girl Friday",
        type: "Movie",
        mediaType: "video",
        thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/His_Girl_Friday_poster.jpg/640px-His_Girl_Friday_poster.jpg",
        description: "A newspaper editor uses every trick in the book to keep his ace reporter ex-wife from remarrying.",
        year: 1940,
        language: "English",
        tags: ["Comedy", "Romance", "Screwball"],
        channel: "Columbia Pictures",
        duration: "1:32:00",
        views: "15M views",
        streamUrl: "https://archive.org/download/his_girl_friday/his_girl_friday_512kb.mp4"
    },
    {
        id: 'metropolis-1927',
        title: "Metropolis",
        type: "Movie",
        mediaType: "video",
        thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Metropolis_poster_1927.jpg/640px-Metropolis_poster_1927.jpg",
        description: "In a futuristic city sharply divided between the working class and the city planners, the son of the city's mastermind falls in love with a working-class prophet who predicts the coming of a savior to mediate their differences.",
        year: 1927,
        language: "Silent",
        tags: ["Sci-Fi", "Drama", "Silent"],
        channel: "Fritz Lang",
        duration: "2:33:00",
        views: "10M views",
        streamUrl: "https://archive.org/download/Metropolis_1927/Metropolis_1927_512kb.mp4"
    },
    {
        id: 'popeye-meets-sinbad',
        title: "Popeye the Sailor Meets Sindbad the Sailor",
        type: "TV Show",
        mediaType: "video",
        thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Popeye_the_Sailor_Meets_Sindbad_the_Sailor_poster.jpg/640px-Popeye_the_Sailor_Meets_Sindbad_the_Sailor_poster.jpg",
        description: "Popeye, Olive Oyl, and J. Wellington Wimpy travel to Sindbad's isle, where the sailor encounters the legendary beast.",
        year: 1936,
        language: "English",
        tags: ["Animation", "Comedy", "Classic"],
        channel: "Fleischer Studios",
        duration: "16:00",
        views: "5M views",
        streamUrl: "https://archive.org/download/Popeye_the_Sailor_Meets_Sindbad_the_Sailor/Popeye_the_Sailor_Meets_Sindbad_the_Sailor_512kb.mp4",
        isSeries: true,
        episodes: [
            {
                id: 'popeye-sinbad',
                title: "Popeye Meets Sindbad",
                episodeNumber: 1,
                season: 1,
                streamUrl: "https://archive.org/download/Popeye_the_Sailor_Meets_Sindbad_the_Sailor/Popeye_the_Sailor_Meets_Sindbad_the_Sailor_512kb.mp4"
            },
            {
                id: 'popeye-ali-baba',
                title: "Popeye Meets Ali Baba",
                episodeNumber: 2,
                season: 1,
                streamUrl: "https://archive.org/download/Popeye_the_Sailor_Meets_Ali_Baba_s_Forty_Thieves/Popeye_the_Sailor_Meets_Ali_Baba_s_Forty_Thieves_512kb.mp4"
            }
        ]
    },
    {
        id: 'flash-gordon-conquers-universe',
        title: "Flash Gordon Conquers the Universe",
        type: "TV Show",
        mediaType: "video",
        thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Flash_Gordon_Conquers_the_Universe_poster.jpg/640px-Flash_Gordon_Conquers_the_Universe_poster.jpg",
        description: "Flash Gordon, Dale Arden and Dr. Zarkov return to the planet Mongo to find a cure for the Purple Death, which is ravaging the earth.",
        year: 1940,
        language: "English",
        tags: ["Sci-Fi", "Adventure", "Serial"],
        channel: "Universal Pictures",
        duration: "20:00",
        views: "3M views",
        streamUrl: "https://archive.org/download/Flash_Gordon_Conquers_the_Universe/Flash_Gordon_Conquers_the_Universe_Chapter_01_The_Purple_Death_512kb.mp4",
        isSeries: true,
        episodes: [
            {
                id: 'flash-gordon-ep1',
                title: "Chapter 1: The Purple Death",
                episodeNumber: 1,
                season: 1,
                streamUrl: "https://archive.org/download/Flash_Gordon_Conquers_the_Universe/Flash_Gordon_Conquers_the_Universe_Chapter_01_The_Purple_Death_512kb.mp4"
            },
            {
                id: 'flash-gordon-ep2',
                title: "Chapter 2: Freezing Torture",
                episodeNumber: 2,
                season: 1,
                streamUrl: "https://archive.org/download/Flash_Gordon_Conquers_the_Universe/Flash_Gordon_Conquers_the_Universe_Chapter_02_Freezing_Torture_512kb.mp4"
            },
            {
                id: 'flash-gordon-ep3',
                title: "Chapter 3: Walking Bombs",
                episodeNumber: 3,
                season: 1,
                streamUrl: "https://archive.org/download/Flash_Gordon_Conquers_the_Universe/Flash_Gordon_Conquers_the_Universe_Chapter_03_Walking_Bombs_512kb.mp4"
            }
        ]
    }
];

// --- COMPONENTS ---

// Detail View Component
const DetailView = ({ content, onBack, onPlay }) => {
    const { addToLibrary, removeFromLibrary, isInLibrary } = usePlayer();
    const isSaved = isInLibrary(content.id);
    const isVideo = content.mediaType === 'video';

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pt-14 animate-in fade-in duration-300">
            {/* Hero Section */}
            <div className="relative w-full h-[75vh]">
                <div className="absolute inset-0">
                    <img src={content.thumbnail || content.cover} className="w-full h-full object-cover blur-2xl opacity-20" alt="Background" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/50" />
                </div>

                <button
                    onClick={onBack}
                    className="absolute top-6 left-6 z-50 bg-black/70 backdrop-blur-md p-3 rounded-full hover:bg-pink-500/20 hover:border-pink-500 border border-white/10 text-white transition-all hover:scale-110"
                >
                    <ChevronLeft size={24} />
                </button>

                <div className="absolute inset-0 flex items-center justify-center px-4">
                    <div className="text-center max-w-5xl">
                        {/* Large Poster */}
                        <div className="mb-8 relative inline-block">
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 blur-3xl opacity-30 rounded-3xl"></div>
                            <img
                                src={content.thumbnail || content.cover}
                                className="relative w-72 h-72 md:w-96 md:h-96 rounded-3xl shadow-2xl object-cover border-2 border-white/10 ring-4 ring-pink-500/20"
                                alt={content.title}
                                onError={(e) => { e.target.src = '/placeholder.svg' }}
                            />
                        </div>

                        {/* Type Badge */}
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                {isVideo ? <Film size={12} /> : <Headphones size={12} />}
                                {content.type}
                            </div>
                            {content.year && (
                                <div className="bg-white/10 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium">
                                    {content.year}
                                </div>
                            )}
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight">{content.title}</h1>

                        <div className="flex items-center justify-center gap-3 text-gray-300 text-sm font-medium mb-8 flex-wrap">
                            <span className="text-pink-400 font-bold">{content.artist || content.channel}</span>
                            {content.language && (
                                <span className="flex items-center gap-1 border border-pink-500/30 px-3 py-1 rounded-full text-white text-xs uppercase bg-pink-500/10 backdrop-blur-md">
                                    <Globe size={12} />
                                    {content.language}
                                </span>
                            )}
                            {content.duration && <span className="text-gray-400">• {content.duration}</span>}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 justify-center mb-8 flex-wrap">
                            <button
                                onClick={() => onPlay(content)}
                                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-12 py-4 rounded-full hover:from-pink-600 hover:to-purple-700 font-bold flex items-center gap-3 text-lg shadow-2xl shadow-pink-500/40 hover:scale-105 transition-all"
                            >
                                <Play fill="currentColor" size={24} /> Play Now
                            </button>
                            <button
                                onClick={() => isSaved ? removeFromLibrary(content.id) : addToLibrary(content)}
                                className={`${isSaved ? 'bg-pink-500/20 border-pink-500 text-pink-400' : 'bg-white/5 border-white/10 text-white'} border-2 px-8 py-4 rounded-full hover:bg-white/10 font-bold flex items-center gap-3 transition-all hover:scale-105`}
                            >
                                <Heart size={20} className={isSaved ? "fill-pink-500" : ""} />
                                {isSaved ? 'Saved' : 'Save'}
                            </button>
                            <button className="bg-white/5 border-2 border-white/10 text-white px-6 py-4 rounded-full hover:bg-white/10 font-bold flex items-center gap-3 transition-all hover:scale-105">
                                <Share2 size={20} />
                            </button>
                        </div>

                        {/* Description */}
                        {content.description && (
                            <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto mb-6">
                                {content.description}
                            </p>
                        )}

                        {/* Tags */}
                        {content.tags && (
                            <div className="flex gap-2 justify-center flex-wrap">
                                {content.tags.map(tag => (
                                    <span key={tag} className="text-xs text-gray-400 bg-white/5 border border-gray-700/50 px-3 py-1.5 rounded-full hover:border-pink-500/50 hover:text-pink-400 transition-colors">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN ARCHIVE PAGE ---

const ArchivePage = () => {
    const { playAudio, playTv, addToLibrary, removeFromLibrary, isInLibrary, audioLibrary, currentMedia, isPlaying } = usePlayer();

    const [activeTab, setActiveTab] = useState("trending");
    const [viewState, setViewState] = useState("feed");
    const [selectedContent, setSelectedContent] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchTimeout, setSearchTimeout] = useState(null);

    const categories = [
        { id: "trending", label: "Trending", icon: <Sparkles size={16} /> },
        { id: "movies", label: "Movies", icon: <Film size={16} /> },
        { id: "audiobooks", label: "Audiobooks", icon: <Headphones size={16} /> },
        { id: "podcasts", label: "Podcasts", icon: <Disc size={16} /> },
        { id: "international", label: "International", icon: <Globe size={16} /> },
        { id: "saved", label: "Saved", icon: <Heart size={16} /> },
    ];

    useEffect(() => {
        loadTabContent(activeTab);
    }, [activeTab]);

    useEffect(() => {
        if (searchTimeout) clearTimeout(searchTimeout);

        if (searchQuery.trim()) {
            const timeout = setTimeout(() => {
                performSearch(searchQuery);
            }, 500);
            setSearchTimeout(timeout);
        }

        return () => {
            if (searchTimeout) clearTimeout(searchTimeout);
        };
    }, [searchQuery]);

    const loadTabContent = async (tab) => {
        setLoading(true);
        setSearchQuery('');
        let results = [];

        try {
            switch (tab) {
                case 'trending':
                    const audioResults = await getTrendingAudio();
                    results = [...VIDEO_ARCHIVE, ...audioResults.slice(0, 12)];
                    break;
                case 'movies':
                    results = VIDEO_ARCHIVE;
                    break;
                case 'audiobooks':
                    results = await searchArchive('fiction OR philosophy OR history');
                    break;
                case 'podcasts':
                    results = await searchPodcasts('tech business science');
                    break;
                case 'international':
                    const [hindi, gujarati, french] = await Promise.all([
                        searchArchive('Hindi', 'hindi'),
                        searchArchive('Gujarati', 'gujarati'),
                        searchArchive('French', 'french')
                    ]);
                    results = [...hindi.slice(0, 5), ...gujarati.slice(0, 5), ...french.slice(0, 5)];
                    break;
                case 'saved':
                    results = audioLibrary;
                    break;
                default:
                    results = await getTrendingAudio();
            }
        } catch (error) {
            console.error("Tab Load Error:", error);
        }

        setItems(results);
        setLoading(false);
    };

    const performSearch = async (query) => {
        if (!query.trim()) return;

        setLoading(true);
        try {
            const [books, pods] = await Promise.all([
                searchArchive(query),
                searchPodcasts(query)
            ]);
            setItems([...VIDEO_ARCHIVE, ...books, ...pods]);
        } catch (error) {
            console.error("Search Error:", error);
        }
        setLoading(false);
    };

    const handleCardClick = (content) => {
        setSelectedContent(content);
        setViewState("detail");
        window.scrollTo(0, 0);
    };

    const handlePlay = (content) => {
        if (content.mediaType === 'video') {
            // Convert to TV format for TunerPlayer
            const tvMedia = {
                type: 'tv',
                id: content.id,
                name: content.title,
                genre: content.type,
                logo: content.thumbnail,
                country: content.language,
                countryFlag: '',
                url: content.streamUrl,
                streamUrl: content.streamUrl,
                isSeries: content.isSeries,
                episodes: content.episodes,
                season: content.season,
                episodeNumber: content.episodeNumber
            };
            playTv(tvMedia);
        } else {
            playAudio(content);
        }
    };

    const handleLibraryToggle = (e, track) => {
        e.stopPropagation();
        if (isInLibrary(track.id)) {
            removeFromLibrary(track.id);
        } else {
            addToLibrary(track);
        }
    };

    return (
        <div className="min-h-screen bg-black text-gray-100 font-sans">

            <main className="w-full">

                {viewState === 'feed' && (
                    <div className="p-4 md:p-8 max-w-[1900px] mx-auto">

                        {/* Header with Search and Icon */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                            <div className="flex items-center gap-3 self-start md:self-auto">
                                <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-pink-500/20">
                                    <UnifiedMediaIcon className="text-white" size={32} />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent tracking-tight">
                                        Archive
                                    </h1>
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Unified Media Library</p>
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div className="w-full md:w-auto md:flex-1 md:max-w-2xl relative group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-400 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search movies, audiobooks, podcasts..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-gray-900/50 backdrop-blur-xl border border-gray-800 focus:border-pink-500/50 rounded-full py-3.5 pl-12 pr-6 text-sm focus:outline-none transition-all placeholder-gray-500 text-white focus:bg-gray-900"
                                />
                            </div>
                        </div>

                        {/* Category Pills (YouTube Style) */}
                        <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-xl -mx-4 px-4 py-4 mb-6 border-b border-white/5">
                            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveTab(cat.id)}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${activeTab === cat.id
                                            ? 'bg-white text-black scale-105 shadow-lg shadow-white/10'
                                            : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800'
                                            }`}
                                    >
                                        {cat.icon}
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-32">
                                <Loader className="animate-spin text-pink-500 mb-4" size={48} />
                                <p className="text-gray-400 font-medium">Loading content...</p>
                            </div>
                        )}

                        {/* Content Grid */}
                        {!loading && items.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                                {items.map((item) => {
                                    const isCurrentlyPlaying = currentMedia?.id === item.id && isPlaying;
                                    const isSaved = isInLibrary(item.id);
                                    const isVideo = item.mediaType === 'video';

                                    return (
                                        <div
                                            key={item.id}
                                            className="group cursor-pointer flex flex-col gap-3"
                                            onClick={() => handleCardClick(item)}
                                        >
                                            {/* Thumbnail */}
                                            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-gray-900 shadow-2xl ring-1 ring-white/5 transition-all duration-500 group-hover:ring-pink-500/50 group-hover:shadow-pink-500/10 group-hover:-translate-y-1">
                                                <img
                                                    src={item.thumbnail || item.cover}
                                                    alt={item.title}
                                                    className={`w-full h-full object-cover transition-all duration-700 ${isCurrentlyPlaying ? 'scale-110 brightness-110' : 'group-hover:scale-110 group-hover:brightness-110'}`}
                                                    onError={(e) => { e.target.src = '/placeholder.svg' }}
                                                />

                                                {/* Gradient Overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                                                {/* Play Overlay */}
                                                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isCurrentlyPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                    <div className={`backdrop-blur-md rounded-full p-4 shadow-2xl ${isCurrentlyPlaying ? 'bg-pink-500 text-white animate-pulse' : 'bg-white/10 text-white border border-white/20 hover:bg-pink-500 hover:border-pink-500 hover:scale-110 transition-all'}`}>
                                                        <Play fill="currentColor" size={24} />
                                                    </div>
                                                </div>

                                                {/* Duration Badge */}
                                                {item.duration && (
                                                    <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2 py-1 text-[10px] font-bold rounded text-white shadow-lg border border-white/10">
                                                        {item.duration}
                                                    </div>
                                                )}

                                                {/* Type Badge */}
                                                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white shadow-lg flex items-center gap-1 border border-white/10">
                                                    {isVideo ? <Film size={10} className="text-blue-400" /> : <Headphones size={10} className="text-pink-400" />}
                                                    {item.type}
                                                </div>

                                                {/* Heart Button */}
                                                <button
                                                    onClick={(e) => handleLibraryToggle(e, item)}
                                                    className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md hover:bg-pink-500 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg border border-white/10 hover:border-pink-500"
                                                >
                                                    <Heart
                                                        size={14}
                                                        className={isSaved ? "fill-white text-white" : "text-white"}
                                                    />
                                                </button>
                                            </div>

                                            {/* Meta Info */}
                                            <div className="px-1">
                                                <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 group-hover:text-pink-400 transition-colors mb-1.5">
                                                    {item.title}
                                                </h3>
                                                <div className="flex items-center justify-between text-gray-400 text-xs">
                                                    <span className="font-medium truncate max-w-[70%]">{item.channel || item.artist}</span>
                                                    {item.year && <span>{item.year}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && items.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-32 border border-dashed border-gray-800 rounded-3xl bg-gray-900/30">
                                <UnifiedMediaIcon size={64} className="text-gray-700 mb-6" />
                                <p className="text-gray-400 font-bold text-xl mb-2">No content found</p>
                                <p className="text-gray-500 text-sm">Try a different search or category</p>
                            </div>
                        )}

                        {/* Load More */}
                        {!loading && items.length > 0 && (
                            <div className="mt-16 flex justify-center pb-24">
                                <button
                                    onClick={() => loadTabContent(activeTab)}
                                    className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full font-bold transition-all border border-gray-800 hover:border-gray-700 shadow-lg hover:shadow-xl hover:-translate-y-1"
                                >
                                    <ChevronDown size={18} />
                                    Load More
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Detail View */}
                {viewState === 'detail' && selectedContent && (
                    <DetailView
                        content={selectedContent}
                        onBack={() => setViewState('feed')}
                        onPlay={handlePlay}
                    />
                )}

            </main>
        </div>
    );
};

export default ArchivePage;
