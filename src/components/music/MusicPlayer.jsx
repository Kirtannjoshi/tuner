import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import Hls from 'hls.js';
import { PlayerContext } from '../../contexts/PlayerContext';

const MusicPlayer = () => {
    const [tracks, setTracks] = useState([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);
    const hlsRef = useRef(null);
    const { setPlayerContent } = useContext(PlayerContext);

    useEffect(() => {
        // Fetch music tracks from Jamendo API
        const fetchTracks = async () => {
            try {
                const response = await axios.get('https://api.jamendo.com/v3.0/tracks/', {
                    params: {
                        client_id: import.meta.env.VITE_JAMENDO_CLIENT_ID,
                        format: 'json',
                        limit: 10,
                        // Add more parameters as needed, e.g., tags, genres, etc.
                    },
                });
                if (response.data.results) {
                    setTracks(response.data.results);
                }
            } catch (error) {
                console.error('Error fetching music tracks:', error);
            }
        };

        fetchTracks();
    }, []);

    useEffect(() => {
        if (tracks.length > 0 && audioRef.current) {
            const currentTrack = tracks[currentTrackIndex];
            const audioUrl = currentTrack.audio;

            if (Hls.isSupported() && audioUrl.endsWith('.m3u8')) {
                if (hlsRef.current) {
                    hlsRef.current.destroy();
                }
                hlsRef.current = new Hls();
                hlsRef.current.loadSource(audioUrl);
                hlsRef.current.attachMedia(audioRef.current);
                hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
                    if (isPlaying) {
                        audioRef.current.play();
                    }
                });
            } else if (audioRef.current) {
                if (hlsRef.current) {
                    hlsRef.current.destroy();
                    hlsRef.current = null;
                }
                audioRef.current.src = audioUrl;
                if (isPlaying) {
                    audioRef.current.play();
                }
            }

            setPlayerContent({
                title: currentTrack.name,
                artist: currentTrack.artist_name,
                artwork: currentTrack.image,
            });
        }
    }, [currentTrackIndex, tracks, isPlaying, setPlayerContent]);

    const togglePlayPause = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const playNextTrack = () => {
        setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
    };

    const playPreviousTrack = () => {
        setCurrentTrackIndex((prevIndex) => (prevIndex - 1 + tracks.length) % tracks.length);
    };

    if (tracks.length === 0) {
        return (
            <div className="text-white text-center py-10">
                <p className="text-lg">No music tracks found.</p>
                <p className="text-sm text-gray-400">Please check your internet connection or Jamendo API key.</p>
            </div>
        );
    }

    const currentTrack = tracks[currentTrackIndex];

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-gray-800 rounded-lg shadow-lg">
            <img
                src={currentTrack.image}
                alt={currentTrack.name}
                className="w-48 h-48 object-cover rounded-lg mb-4"
            />
            <h2 className="text-xl font-bold text-white mb-1">{currentTrack.name}</h2>
            <p className="text-gray-400 mb-4">{currentTrack.artist_name}</p>

            <audio ref={audioRef} onEnded={playNextTrack} className="hidden" />

            <div className="flex space-x-4">
                <button
                    onClick={playPreviousTrack}
                    className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                        />
                    </svg>
                </button>
                <button
                    onClick={togglePlayPause}
                    className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none"
                >
                    {isPlaying ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 9v6m4-6v6m-4-3h4"
                            />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    )}
                </button>
                <button
                    onClick={playNextTrack}
                    className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 5l7 7-7 7M5 5l7 7-7 7"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default MusicPlayer;