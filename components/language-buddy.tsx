'use client';
// app/components/LanguageBuddy.tsx (updated with TTS support)

import { useState, useEffect } from 'react';
import AudioRecorder from './audio-recorder';
import UserProfile, { UserProfileData } from './user-profile';
import MessageItem from './message-item';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    detectedLanguage?: 'english' | 'japanese';
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

        try {
            // Show loading state
            setMessages(prev => [
                ...prev,
                { role: 'system', content: 'Processing your message...' }
            ]);

            // Prepare message history for context
            // Filter out system messages and limit to recent exchanges
            const messageHistory = messages
                .filter(msg => msg.role === 'user' || msg.role === 'assistant')
                .slice(-6) // Get last 6 messages (3 exchanges)
                .map(msg => ({
                    role: msg.role,
                    content: msg.content
                }));

            // Call the language response API with message history
            const response = await fetch('/api/language-response', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    detectedLanguage,
                    userProfile,
                    messageHistory
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate response');
            }

            const data = await response.json();

            // Remove the loading message
            setMessages(prev => prev.filter(msg => msg.content !== 'Processing your message...'));

            // Add assistant message to the chat
            const assistantMessage: Message = {
                role: 'assistant',
                content: data.message,
                // For TTS purposes, we determine the language of the response for better voice selection
                detectedLanguage: detectLanguage(data.message)
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error generating response:', error);

            // Remove the loading message
            setMessages(prev => prev.filter(msg => msg.content !== 'Processing your message...'));

            // Add error message
            setMessages(prev => [
                ...prev,
                {
                    role: 'system',
                    content: 'Sorry, there was an error generating a response. Please try again.'
                }
            ]);
        }
    };

    const detectLanguage = (text: string): 'japanese' | 'english' => {
        const japaneseChars = text.match(/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/g);
        return japaneseChars && japaneseChars.length > text.length * 0.3 ? 'japanese' : 'english';
    }

    const handleRecordingStateChange = (isRecording: boolean) => {
        setIsRecording(isRecording);
    }

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
                    <MessageItem
                        key={index}
                        role={message.role}
                        content={message.content}
                        detectedLanguage={message.detectedLanguage}
                    />
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
