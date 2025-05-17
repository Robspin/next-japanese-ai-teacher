'use client';
// app/components/UserProfile.tsx

import { useState, useEffect } from 'react';

interface UserProfileProps {
    onProfileUpdate: (profile: UserProfileData) => void;
}

export interface UserProfileData {
    nativeLanguage: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    interests: string[];
}

export default function UserProfile({ onProfileUpdate }: UserProfileProps) {
    const [profile, setProfile] = useState<UserProfileData>({
        nativeLanguage: 'english',
        level: 'beginner',
        interests: [],
    });
    const [isEditing, setIsEditing] = useState(false);
    const [interestInput, setInterestInput] = useState('');

    // Load profile from localStorage on component mount
    useEffect(() => {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            try {
                setProfile(JSON.parse(savedProfile));
            } catch (e) {
                console.error('Error parsing saved profile:', e);
            }
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Save to localStorage
        localStorage.setItem('userProfile', JSON.stringify(profile));

        // Notify parent component
        onProfileUpdate(profile);

        // Exit edit mode
        setIsEditing(false);
    };

    const addInterest = () => {
        if (interestInput.trim()) {
            setProfile(prev => ({
                ...prev,
                interests: [...prev.interests, interestInput.trim()]
            }));
            setInterestInput('');
        }
    };

    const removeInterest = (index: number) => {
        setProfile(prev => ({
            ...prev,
            interests: prev.interests.filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Your Profile</h3>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-sm text-blue-500 hover:text-blue-700"
                >
                    {isEditing ? 'Cancel' : 'Edit'}
                </button>
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Native Language</label>
                        <select
                            value={profile.nativeLanguage}
                            onChange={e => setProfile(prev => ({ ...prev, nativeLanguage: e.target.value }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="english">English</option>
                            <option value="japanese">Japanese</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Japanese Level</label>
                        <select
                            value={profile.level}
                            onChange={e => setProfile(prev => ({
                                ...prev,
                                level: e.target.value as 'beginner' | 'intermediate' | 'advanced'
                            }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Interests</label>
                        <div className="flex mt-1">
                            <input
                                type="text"
                                value={interestInput}
                                onChange={e => setInterestInput(e.target.value)}
                                className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Add an interest (e.g., travel, anime, food)"
                            />
                            <button
                                type="button"
                                onClick={addInterest}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                                Add
                            </button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {profile.interests.map((interest, index) => (
                                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {interest}
                                    <button
                                        type="button"
                                        onClick={() => removeInterest(index)}
                                        className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-blue-400 hover:text-blue-600"
                                    >
                    ×
                  </button>
                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Save
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-2">
                    <p><span className="font-medium">Native Language:</span> {profile.nativeLanguage === 'other' ? 'Other' : profile.nativeLanguage === 'english' ? 'English' : 'Japanese'}</p>
                    <p><span className="font-medium">Japanese Level:</span> {profile.level.charAt(0).toUpperCase() + profile.level.slice(1)}</p>
                    <div>
                        <p className="font-medium">Interests:</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                            {profile.interests.length > 0 ? (
                                profile.interests.map((interest, index) => (
                                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {interest}
                  </span>
                                ))
                            ) : (
                                <span className="text-sm text-gray-500">No interests added yet</span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}