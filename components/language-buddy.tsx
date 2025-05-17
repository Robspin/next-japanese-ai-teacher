'use client';
// app/components/LanguageBuddy.tsx (updated to use UserProfile)

import { useState, useEffect } from 'react';
import AudioRecorder from './audio-recorder';
import UserProfile, { UserProfileData } from './user-profile';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    detectedLanguage?: string;
}

export default function LanguageBuddy() {
    const [transcription, setTranscription] = useState<string>('');
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [userProfile, setUserProfile] = useState<UserProfileData>({
        nativeLanguage: 'english',
        level: 'beginner',
        interests: [],
    });
    const [messages, setMessages] = useState<Message[]>([
        { role: 'system', content: 'Welcome to Language Buddy! Record some speech in English or Japanese.' }
    ]);

    // Load saved profile and messages from localStorage
    useEffect(() => {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            try {
                setUserProfile(JSON.parse(savedProfile));
            } catch (e) {
                console.error('Error parsing saved profile:', e);
            }
        }

        const savedMessages = localStorage.getItem('chatMessages');
        if (savedMessages) {
            try {
                setMessages(JSON.parse(savedMessages));
            } catch (e) {
                console.error('Error parsing saved messages:', e);
            }
        }
    }, []);

    // Save messages to localStorage when they change
    useEffect(() => {
        localStorage.setItem('chatMessages', JSON.stringify(messages));
    }, [messages]);

    // Handle profile updates
    const handleProfileUpdate = (updatedProfile: UserProfileData) => {
        setUserProfile(updatedProfile);

        // Add a system message about the updated profile
        setMessages(prev => [
            ...prev,
            {
                role: 'system',
                content: `Profile updated! Your Japanese level is now set to ${updatedProfile.level}.`
            }
        ]);
    };

    // Handle new transcription from the AudioRecorder component
    const handleTranscription = async (text: string) => {
        if (!text.trim()) return;

        // Detect language (simple implementation)
        const detectedLanguage = detectLanguage(text);

        // Add user message to the chat
        const userMessage: Message = {
            role: 'user',
            content: text,
            detectedLanguage
        };
        setMessages(prev => [...prev, userMessage]);

        // Store the transcription
        setTranscription(text);

        // In a complete implementation, you would send the text to ChatGPT API
        // For this example, we'll just generate a simple response based on the profile

        // Create a simple response based on detected language and user profile
        let responseContent = '';

        if (detectedLanguage === 'japanese') {
            // If user spoke Japanese
            switch(userProfile.level) {
                case 'beginner':
                    responseContent = `I heard you speak in Japanese: "${text}"\n\nGreat attempt for a beginner! I would respond with simple phrases like "はい、わかります" (Yes, I understand) or "ありがとう" (Thank you).`;
                    break;
                case 'intermediate':
                    responseContent = `あなたの日本語を聞きました: "${text}"\n\nなかなか上手ですね！(Your Japanese is pretty good!) Keep practicing and you'll continue to improve.`;
                    break;
                case 'advanced':
                    responseContent = `素晴らしい日本語ですね！"${text}"\n\n日本語がとても流暢です。さらに練習を続けましょう。(Your Japanese is excellent. Let's continue practicing.)`;
                    break;
            }
        } else {
            // If user spoke English
            switch(userProfile.level) {
                case 'beginner':
                    responseContent = `I heard: "${text}"\n\nSince you're a beginner, I'd say: "こんにちは" (Hello) or "お元気ですか？" (How are you?)`;
                    break;
                case 'intermediate':
                    responseContent = `I heard: "${text}"\n\n日本語で話しましょうか？(Shall we speak in Japanese?) You could say: "${getJapaneseEquivalent(text, 'intermediate')}"`;
                    break;
                case 'advanced':
                    responseContent = `I heard: "${text}"\n\n日本語に翻訳すると: "${getJapaneseEquivalent(text, 'advanced')}"\n\n複雑な表現も使ってみましょう！(Let's try using more complex expressions!)`;
                    break;
            }
        }

        // Add interests-based content if available
        if (userProfile.interests.length > 0) {
            const randomInterest = userProfile.interests[Math.floor(Math.random() * userProfile.interests.length)];
            responseContent += `\n\nBy the way, I noticed you're interested in ${randomInterest}. Would you like to learn some Japanese vocabulary related to that?`;
        }

        // Add assistant message to the chat
        const assistantMessage: Message = {
            role: 'assistant',
            content: responseContent,
            detectedLanguage: detectedLanguage === 'japanese' ? 'english' : 'japanese' // For text-to-speech purposes
        };

        setMessages(prev => [...prev, assistantMessage]);
    };

    // Simple language detection
    const detectLanguage = (text: string): 'japanese' | 'english' => {
        const japaneseChars = text.match(/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/g);
        return japaneseChars && japaneseChars.length > text.length * 0.3 ? 'japanese' : 'english';
    };

    // Simple placeholder function to simulate Japanese translation
    const getJapaneseEquivalent = (text: string, level: string): string => {
        // In a real app, this would call an API or use a more sophisticated method
        // Here we're just returning placeholder content based on level
        if (text.toLowerCase().includes('hello') || text.toLowerCase().includes('hi')) {
            return 'こんにちは';
        }
        if (text.toLowerCase().includes('how are you')) {
            return 'お元気ですか？';
        }
        if (text.toLowerCase().includes('thank you')) {
            return 'ありがとうございます';
        }

        return level === 'advanced'
            ? '(This would be an advanced Japanese translation of your text)'
            : '(This would be a simple Japanese translation of your text)';
    };

    // Handle recording state changes
    const handleRecordingStateChange = (isRecording: boolean) => {
        setIsRecording(isRecording);
    };

    // Clear chat history
    const clearChat = () => {
        setMessages([
            { role: 'system', content: 'Chat history cleared. Ready for a new conversation!' }
        ]);
        localStorage.removeItem('chatMessages');
    };

    return (
        <div className="flex flex-col gap-6">
            <UserProfile onProfileUpdate={handleProfileUpdate} />

            <div className="bg-white p-4 rounded-lg shadow h-96 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Conversation</h3>
                    <button
                        onClick={clearChat}
                        className="text-sm text-red-500 hover:text-red-700"
                    >
                        Clear Chat
                    </button>
                </div>

                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`mb-4 p-3 rounded-lg ${
                            message.role === 'user'
                                ? 'bg-blue-100 ml-auto max-w-[80%]'
                                : message.role === 'assistant'
                                    ? 'bg-green-100 max-w-[80%]'
                                    : 'bg-gray-200 text-center mx-auto'
                        }`}
                    >
                        <div className="text-sm font-semibold mb-1">
                            {message.role === 'user' ? 'You' : message.role === 'assistant' ? 'Language Buddy' : 'System'}
                        </div>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col items-center gap-4">
                <AudioRecorder
                    onTranscription={handleTranscription}
                    onRecordingStateChange={handleRecordingStateChange}
                />

                {transcription && !isRecording && (
                    <div className="text-sm text-gray-700 border-t border-gray-200 pt-4 mt-2 w-full">
                        <div className="font-medium">Last transcription:</div>
                        <div className="mt-1 p-2 bg-gray-50 rounded">{transcription}</div>
                    </div>
                )}
            </div>
        </div>
    );
}
