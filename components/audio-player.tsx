'use client'

import { useState, useEffect, useRef } from 'react';

interface AudioPlayerProps {
    text: string;
    language: 'english' | 'japanese';
}

export default function AudioPlayer({ text, language }: AudioPlayerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    // Clean up previous audio URL when component unmounts
    useEffect(() => {
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);

    const generateAndPlaySpeech = async () => {
        // Don't regenerate if already playing
        if (isPlaying) {
            audioRef.current?.pause();
            setIsPlaying(false);
            return;
        }

        // Don't regenerate if we already have audio and just paused it
        if (audioRef.current && audioUrl) {
            audioRef.current.play();
            setIsPlaying(true);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Get only first 4000 characters (TTS-1 limit)
            const truncatedText = text.slice(0, 4000);

            // Call our API endpoint
            const response = await fetch('/api/text-to-speech', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: truncatedText,
                    language,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate speech');
            }

            // Get the audio as blob
            const audioBlob = await response.blob();

            // Create a URL for the blob
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl); // Clean up old URL
            }
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);

            // Create and play audio element
            if (!audioRef.current) {
                audioRef.current = new Audio(url);

                // Setup audio event listeners
                audioRef.current.onended = () => setIsPlaying(false);
                audioRef.current.onpause = () => setIsPlaying(false);
                audioRef.current.onplay = () => setIsPlaying(true);
                audioRef.current.onerror = () => {
                    setError('Error playing audio');
                    setIsPlaying(false);
                };
            } else {
                audioRef.current.src = url;
            }

            // Play the audio
            await audioRef.current.play();
            setIsPlaying(true);
        } catch (err) {
            console.error('Error generating or playing speech:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <button
                onClick={generateAndPlaySpeech}
                disabled={isLoading}
                className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${
                    isPlaying
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : isLoading
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
                title={language === 'japanese' ? 'Listen in Japanese' : 'Listen in English'}
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Loading...</span>
                    </>
                ) : isPlaying ? (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 18M6 6L18 6" />
                        </svg>
                        <span>Stop</span>
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zm12.728 3.536l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 011.414-1.414z"
                            />
                        </svg>
                        <span>{language === 'japanese' ? '再生' : 'Play'}</span>
                    </>
                )}
            </button>

            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}
