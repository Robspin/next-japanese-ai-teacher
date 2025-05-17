// app/components/VocabularyTracker.tsx
'use client';

import { useState, useEffect } from 'react';

interface VocabularyItem {
    japanese: string;
    english: string;
    romaji?: string;
    dateAdded: number;
    reviewCount: number;
    lastReviewed?: number;
}

export default function VocabularyTracker() {
    const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
    const [newWord, setNewWord] = useState({ japanese: '', english: '', romaji: '' });
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        const savedVocabulary = localStorage.getItem('vocabulary');
        if (savedVocabulary) {
            try {
                setVocabulary(JSON.parse(savedVocabulary));
            } catch (e) {
                console.error('Error parsing saved vocabulary:', e);
            }
        }
    }, []);

    // Save vocabulary to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('vocabulary', JSON.stringify(vocabulary));
    }, [vocabulary]);

    // Add a new vocabulary item
    const addVocabularyItem = () => {
        if (newWord.japanese.trim() && newWord.english.trim()) {
            const newItem: VocabularyItem = {
                ...newWord,
                dateAdded: Date.now(),
                reviewCount: 0,
            };

            setVocabulary(prev => [...prev, newItem]);
            setNewWord({ japanese: '', english: '', romaji: '' });
            setIsAdding(false);
        }
    };

    // Mark a word as reviewed
    const reviewWord = (index: number) => {
        setVocabulary(prev => prev.map((item, i) => {
            if (i === index) {
                return {
                    ...item,
                    reviewCount: item.reviewCount + 1,
                    lastReviewed: Date.now()
                };
            }
            return item;
        }));
    };

    // Remove a vocabulary item
    const removeWord = (index: number) => {
        setVocabulary(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Vocabulary ({vocabulary.length})</h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="text-sm text-blue-500 hover:text-blue-700"
                >
                    {isAdding ? 'Cancel' : 'Add Word'}
                </button>
            </div>

            {isAdding && (
                <div className="mb-4 p-3 border border-gray-200 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Japanese</label>
                            <input
                                type="text"
                                value={newWord.japanese}
                                onChange={(e) => setNewWord(prev => ({ ...prev, japanese: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="日本語"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">English</label>
                            <input
                                type="text"
                                value={newWord.english}
                                onChange={(e) => setNewWord(prev => ({ ...prev, english: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="English meaning"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Romaji (Optional)</label>
                            <input
                                type="text"
                                value={newWord.romaji}
                                onChange={(e) => setNewWord(prev => ({ ...prev, romaji: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="nihongo"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={addVocabularyItem}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            Add Word
                        </button>
                    </div>
                </div>
            )}

            {vocabulary.length > 0 ? (
                <div className="overflow-y-auto max-h-60">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Japanese</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">English</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Romaji</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {vocabulary.map((word, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">{word.japanese}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm">{word.english}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{word.romaji || '-'}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-right">
                                    <button
                                        onClick={() => reviewWord(index)}
                                        className="text-green-500 hover:text-green-700 mr-2"
                                        title="Mark as reviewed"
                                    >
                                        ✓
                                    </button>
                                    <button
                                        onClick={() => removeWord(index)}
                                        className="text-red-500 hover:text-red-700"
                                        title="Remove word"
                                    >
                                        ×
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center text-gray-500 py-4">No vocabulary words yet. Add some words to track your progress!</p>
            )}
        </div>
    );
}
