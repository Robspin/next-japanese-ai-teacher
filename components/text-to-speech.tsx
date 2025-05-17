// app/components/TextToSpeech.tsx
'use client';

import { useEffect, useState } from 'react';

interface TextToSpeechProps {
    text: string;
    language: string;
}

export default function TextToSpeech({ text, language }: TextToSpeechProps) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(true);

    useEffect(() => {
        if (!('speechSynthesis' in window)) {
            setSpeechSupported(false);
        }
    }, []);

    const speak = () => {
        if (!speechSupported || !text) return;

        const utterance = new SpeechSynthesisUtterance(text);

        // Set language based on detected language
        utterance.lang = language === 'japanese' ? 'ja-JP' : 'en-US';

        // Optional: adjust speech rate for language learning
        utterance.rate = 0.9;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        if (speechSupported) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    if (!speechSupported) return null;

    return (
        <button
            onClick={isSpeaking ? stopSpeaking : speak}
            className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
                isSpeaking ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            } text-white`}
        >
            {isSpeaking ? (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
                    </svg>
                    Stop
                </>
            ) : (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/>
                        <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"/>
                        <path d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z"/>
                    </svg>
                    Speak
                </>
            )}
        </button>
    );
}
