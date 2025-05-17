import LanguageBuddy from '@/components/language-buddy'
import VocabularyTracker from '@/components/vocabulary-tracker'

export default function Home() {
    return (
        <main className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-center mb-8">
                    Next.js Language Buddy
                </h1>

                <div className="grid grid-cols-1 gap-6">
                    <LanguageBuddy />
                    <VocabularyTracker />
                </div>

                <footer className="mt-12 text-center text-gray-500 text-sm">
                    <p>
                        Built with Next.js 15, OpenAI Whisper, and GPT-4
                    </p>
                </footer>
            </div>
        </main>
    );
}
