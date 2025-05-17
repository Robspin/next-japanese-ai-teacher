'use client'
import { useState } from 'react'
import AudioPlayer from './audio-player'

interface MessageItemProps {
    role: 'user' | 'assistant' | 'system';
    content: string;
    detectedLanguage?: 'english' | 'japanese';
}

export default function MessageItem({ role, content, detectedLanguage = 'japanese' }: MessageItemProps) {
    const [isSpeechExpanded, setIsSpeechExpanded] = useState(false);

    // Handle messages that might be too long for TTS
    const isTooLongForSpeech = content.length > 4000;

    // Generate a shortened version for speech if content is too long
    const getSpeechText = () => {
        if (!isTooLongForSpeech) return content;

        // If expanded, get first 4000 chars, otherwise first 200 chars
        return isSpeechExpanded
            ? content.slice(0, 4000)
            : content.slice(0, 200) + '... (Click "Show More" to hear more)';
    };

    return (
        <div
            className={`mb-4 p-3 rounded-lg ${
                role === 'user'
                    ? 'bg-blue-100 ml-auto max-w-[80%]'
                    : role === 'assistant'
                        ? 'bg-green-100 max-w-[80%]'
                        : 'bg-gray-200 text-center mx-auto'
            }`}
        >
            <div className="flex justify-between items-center mb-1">
                <div className="text-sm font-semibold">
                    {role === 'user' ? 'You' : role === 'assistant' ? 'Language Buddy' : 'System'}
                </div>

                {role === 'assistant' && (
                    <AudioPlayer
                        text={getSpeechText()}
                        language={detectedLanguage}
                    />
                )}
            </div>

            <div className="whitespace-pre-wrap">{content}</div>

            {/* Show option to expand for TTS if content is too long */}
            {role === 'assistant' && isTooLongForSpeech && (
                <button
                    onClick={() => setIsSpeechExpanded(!isSpeechExpanded)}
                    className="text-xs text-blue-600 hover:text-blue-800 mt-2"
                >
                    {isSpeechExpanded ? "Show Less for Speech" : "Show More for Speech"}
                </button>
            )}
        </div>
    );
}
