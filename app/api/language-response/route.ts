import { NextRequest, NextResponse } from 'next/server';
import openai from '@/utils/openai';

// Define interface for message history
interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

// Max number of previous messages to include for context
const MAX_HISTORY_MESSAGES = 6; // 3 exchanges (user + assistant)

export async function POST(request: NextRequest) {
    try {
        const { text, detectedLanguage, userProfile, messageHistory = [] } = await request.json();

        if (!text) {
            return NextResponse.json(
                { error: 'No text provided' },
                { status: 400 }
            );
        }

        // Create a customized system prompt based on user profile
        const level = userProfile?.level || 'beginner';
        const interests = userProfile?.interests || [];
        const nativeLanguage = userProfile?.nativeLanguage || 'english';

        const systemPrompt = `You are a helpful Japanese language learning assistant.
      The user's native language is ${nativeLanguage}.
      Their Japanese level is ${level}.
      ${interests.length > 0 ? `Their interests include: ${interests.join(', ')}.` : ''}
      
      The user is currently speaking in ${detectedLanguage}.
      
      ${detectedLanguage === 'japanese'
            ? `Since they are speaking in Japanese:
           - Respond primarily in Japanese appropriate for their ${level} level
           - Gently correct any mistakes they make
           - Include English translations in parentheses for key phrases
           - For beginners, use simpler Japanese and more English
           - For intermediate learners, use moderate Japanese with some English explanations
           - For advanced learners, use more complex Japanese with minimal English`
            : `Since they are speaking in English:
           - Respond primarily in English, but incorporate Japanese phrases appropriate for their ${level} level
           - Include romaji (Japanese written in Latin letters) and translations for any Japanese you use
           - For beginners, teach very basic phrases and vocabulary
           - For intermediate learners, introduce more complex grammar and vocabulary
           - For advanced learners, use more sophisticated Japanese expressions`
        }
      
      ${interests.length > 0
            ? `Try to relate your response to one of their interests (${interests.join(', ')}) if possible.`
            : 'Focus on practical, everyday Japanese that would be useful in conversation.'
        }
      
      If they've made mistakes in Japanese, gently correct them, showing both their version and the correct version.
      
      Keep your response friendly, encouraging, and focused on helping them improve their Japanese.
      
      Remember to maintain continuity with the previous conversation context if available.`;

        // Prepare messages array with system prompt and conversation history
        const messages: Message[] = [
            { role: 'system', content: systemPrompt },
        ];

        // Add conversation history if available, limited to MAX_HISTORY_MESSAGES
        if (messageHistory && messageHistory.length > 0) {
            // Get the most recent messages (limited by MAX_HISTORY_MESSAGES)
            const recentMessages = messageHistory.slice(-MAX_HISTORY_MESSAGES);

            // Add them to the messages array
            messages.push(...recentMessages);
        }

        // Add the current user message
        messages.push({ role: 'user', content: text });

        // Call ChatGPT API
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: messages,
            temperature: 0.7,
            max_tokens: 1000,
        });

        // Return the response
        return NextResponse.json({
            message: completion.choices[0].message.content,
            detectedLanguage,
            success: true
        });
    } catch (error) {
        console.error('Language response API error:', error);
        return NextResponse.json(
            { error: 'Failed to generate response', details: String(error) },
            { status: 500 }
        );
    }
}
