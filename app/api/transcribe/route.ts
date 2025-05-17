import { NextRequest, NextResponse } from 'next/server';
import { createReadStream } from 'fs';
import { unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import openai from '@/utils/openai'

// Use a directory that's writable in serverless environments
const TMP_DIR = process.env.NODE_ENV === 'production' ? '/tmp' : './tmp';

export async function POST(request: NextRequest) {
    let tempFilePath = null;

    try {
        // Get FormData from the request
        const formData = await request.formData();

        // Get the audio file from the form data
        const audioFile = formData.get('audio') as File;

        if (!audioFile) {
            return NextResponse.json(
                { error: 'No audio file provided' },
                { status: 400 }
            );
        }

        // Generate a unique filename to avoid collisions
        const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);
        tempFilePath = join(TMP_DIR, `audio_${uniqueId}.webm`);

        // Convert the File to a Buffer and save it to a temporary file
        const arrayBuffer = await audioFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await writeFile(tempFilePath, buffer);

        // Create a readable stream from the file
        const fileStream = createReadStream(tempFilePath);

        // Use the OpenAI API to transcribe the audio
        const transcription = await openai.audio.transcriptions.create({
            file: fileStream,
            model: 'whisper-1',
        });

        // Clean up the temporary file
        try {
            await unlink(tempFilePath);
        } catch (cleanupError) {
            console.error('Error deleting temporary file:', cleanupError);
        }

        // Return the transcription result
        return NextResponse.json({
            text: transcription.text,
            success: true
        });
    } catch (error) {
        console.error('Transcription error:', error);

        // Attempt to clean up temp file if it exists
        if (tempFilePath) {
            try {
                await unlink(tempFilePath);
            } catch (cleanupError) {
                console.error('Error deleting temporary file:', cleanupError);
            }
        }

        return NextResponse.json(
            { error: 'Failed to transcribe audio', details: String(error) },
            { status: 500 }
        );
    }
}

// Disable the default body parser to handle the form data
export const config = {
    api: {
        bodyParser: false,
    },
}