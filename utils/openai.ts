import OpenAI from 'openai'

// This will be used server-side only
// Note: In Next.js, this code will never run on the client
// because it's only imported in server components or API routes
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default openai;