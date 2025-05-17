import { NextRequest, NextResponse } from 'next/server';
import openai from '@/utils/openai';

export async function POST(request: NextRequest) {
    try {
        const { text, language } = await request.json();

        if (!text) {
            return NextResponse.json(
                { error: 'No text provided' },
                { status: 400 }
            );
        }

        // Determine the voice model based on language
        // OpenAI provides different voices with various characteristics
        // 'alloy', 'echo', 'fable', 'onyx', 'nova', and 'shimmer'
        // For Japanese, 'nova' and 'shimmer' generally work well
        const voice = language === 'japanese' ? 'nova' : 'alloy';

        // Create a speech synthesis response
        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: voice,
            input: text,
        });

        // Convert to ArrayBuffer
        const buffer = await mp3.arrayBuffer();

        // Return the audio as a stream
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': buffer.byteLength.toString(),
            },
        });
    } catch (error) {
        console.error('Text-to-speech error:', error);
        return NextResponse.json(
            { error: 'Failed to generate speech', details: String(error) },
            { status: 500 }
        );
    }
}