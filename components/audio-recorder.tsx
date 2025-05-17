'use client';
// app/components/AudioRecorder.tsx
import { useState, useRef } from 'react';

interface AudioRecorderProps {
    onTranscription: (text: string) => void;
    onRecordingStateChange: (isRecording: boolean) => void;
}

export default function AudioRecorder({ onTranscription, onRecordingStateChange }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Toggle recording state
    const toggleRecording = async () => {
        if (isRecording) {
            stopRecording();
        } else {
            await startRecording();
        }
    };

    // Start recording from the microphone
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Reset audio chunks
            audioChunksRef.current = [];

            // Create a new MediaRecorder instance
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            // Listen for dataavailable event
            mediaRecorder.addEventListener('dataavailable', (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            });

            // Listen for stop event
            mediaRecorder.addEventListener('stop', () => {
                processAudio();
            });

            // Start recording
            mediaRecorder.start();
            setIsRecording(true);
            onRecordingStateChange(true);
        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Could not access microphone. Please check permissions.');
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();

            // Stop all microphone streams
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());

            setIsRecording(false);
            onRecordingStateChange(false);
        }
    };

    // Process recorded audio and send to the server for transcription
    const processAudio = async () => {
        if (audioChunksRef.current.length === 0) return;

        try {
            setIsProcessing(true);

            // Create a blob from the audio chunks
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

            // Create form data to send to the server
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');

            // Send the audio to the server for transcription
            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to transcribe audio');
            }

            const data = await response.json();

            // Pass the transcription text to the parent component
            onTranscription(data.text);
        } catch (error) {
            console.error('Error processing audio:', error);
            alert('Error processing audio: ' + String(error));
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <button
                onClick={toggleRecording}
                disabled={isProcessing}
                className={`px-6 py-3 rounded-full font-medium flex items-center justify-center gap-2 ${
                    isRecording
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {isRecording ? (
                    <>
                        <span className="h-3 w-3 rounded-full bg-white animate-pulse"></span>
                        Stop Recording
                    </>
                ) : isProcessing ? (
                    'Processing...'
                ) : (
                    'Start Recording'
                )}
            </button>

            {isProcessing && (
                <div className="text-sm text-gray-500">
                    Transcribing your audio... Please wait.
                </div>
            )}
        </div>
    );
}
