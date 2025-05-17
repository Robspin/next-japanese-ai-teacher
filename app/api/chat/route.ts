import { NextRequest, NextResponse } from 'next/server'
import openai from '@/utils/openai'

// This is an optional API route to handle language processing with GPT-4
// You can extend the minimal example with this route

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { text, language } = body;

        if (!text) {
            return NextResponse.json(
                { error: 'No text provided' },
                { status: 400 }
            );
        }

        // Detect language if not provided
        let detectedLanguage = language;
        if (!detectedLanguage) {
            // Simple language detection (you can make this more sophisticated)
            const japaneseChars = text.match(/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/g);
            detectedLanguage = japaneseChars && japaneseChars.length > text.length * 0.3 ? 'japanese' : 'english';
        }

        // Create a system prompt based on detected language
        const systemPrompt = detectedLanguage === 'japanese'
            ? `You are a helpful Japanese language tutor. The user is speaking in Japanese. 
         Respond in simple Japanese, and provide gentle corrections if there are any mistakes.
         If needed, include English translations in parentheses.`
            : `You are a helpful Japanese language tutor. The user is speaking in English.
         Respond primarily in English, but incorporate simple Japanese phrases where appropriate.
         Include romaji and translations for any Japanese you use.`;

        // Call ChatGPT API
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: text }
            ],
            temperature: 0.7,
        });

        // Return the response
        return NextResponse.json({
            message: completion.choices[0].message.content,
            detectedLanguage,
            success: true
        });
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Failed to process message', details: String(error) },
            { status: 500 }
        );
    }
}
