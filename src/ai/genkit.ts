import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Store the singleton instance.
let ai: any = null;

/**
 * Initializes and returns a singleton instance of the Genkit AI object.
 * This lazy initialization is crucial for compatibility with Next.js server actions,
 * ensuring that Genkit is only initialized when it's first used within a request,
 * not at the module-load time.
 */
export function getAi() {
  if (!ai) {
    ai = genkit({
      plugins: [googleAI()],
      model: 'googleai/gemini-2.5-flash',
    });
  }
  return ai;
}
