import Groq from 'groq-sdk';

// Initialize Groq client
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export type AIAction = 'summarize' | 'improve' | 'extract_tasks';

interface AIPromptConfig {
  systemPrompt: string;
  userPrompt: (content: string) => string;
}

const AI_PROMPTS: Record<AIAction, AIPromptConfig> = {
  summarize: {
    systemPrompt: 'You are a concise summarization assistant. Always return exactly 5 bullet points followed by one key takeaway line. Use plain text, no markdown headings or formatting.',
    userPrompt: (content: string) => `Summarize the following note in exactly 5 bullet points, followed by one "Key Takeaway:" line:\n\n${content}`,
  },
  improve: {
    systemPrompt: 'You are a professional writing assistant. Rewrite text to fix grammar and improve clarity while keeping the original meaning and length within ±20%. Use a neutral, professional tone.',
    userPrompt: (content: string) => `Rewrite the following text to improve grammar and clarity. Keep the meaning the same and maintain similar length (±20%):\n\n${content}`,
  },
  extract_tasks: {
    systemPrompt: 'You are a task extraction assistant. Extract actionable tasks from text and return them as a JSON array of strings. Each task should be a short, clear action item (max 10 tasks). Return ONLY valid JSON array, nothing else.',
    userPrompt: (content: string) => `Extract actionable tasks from the following note. Return a JSON array of strings, each being a short task title (max 10 tasks):\n\n${content}`,
  },
};

export async function generateAIResponse(action: AIAction, content: string): Promise<string> {
  if (!groq) {
    throw new Error('Groq API key not configured. Please set GROQ_API_KEY in environment variables. Get your free key at https://console.groq.com/keys');
  }

  const config = AI_PROMPTS[action];
  const messages = [
    { role: 'system' as const, content: config.systemPrompt },
    { role: 'user' as const, content: config.userPrompt(content) },
  ];

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile', // Updated to supported model
      messages,
      temperature: 0.3,
      max_tokens: 1024,
    });
    return response.choices[0]?.message?.content || '';
  } catch (error: any) {
    if (error.message?.includes('API key') || error.message?.includes('401')) {
      throw new Error('Invalid Groq API key. Please check your GROQ_API_KEY in .env file.');
    }
    throw new Error(`AI generation failed: ${error.message}`);
  }
}

export function parseActionItems(output: string): string[] {
  try {
    // Try to find JSON array in the output
    const jsonMatch = output.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      // If no JSON array found, try to extract tasks from bullet points or numbered lists
      const lines = output.split('\n')
        .map(line => line.trim())
        .filter(line => {
          // Match bullet points, numbered lists, or lines starting with task indicators
          return /^[-*•]\s+/.test(line) || /^\d+\.\s+/.test(line) || /^task\s*\d*:/i.test(line);
        })
        .map(line => line.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '').replace(/^task\s*\d*:\s*/i, '').trim())
        .filter(line => line.length > 0)
        .slice(0, 10);

      if (lines.length > 0) {
        return lines;
      }

      throw new Error('Could not extract tasks from the note. The AI did not find any actionable items. Try adding more specific action-oriented content to your note.');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid response format from AI');
    }

    // Validate all items are strings and limit to 10
    const items = parsed
      .filter((item) => typeof item === 'string' && item.trim().length > 0)
      .slice(0, 10);

    if (items.length === 0) {
      throw new Error('No actionable tasks found in your note. Try adding specific action items like "Call John" or "Review report".');
    }

    return items;
  } catch (error: any) {
    // Return user-friendly error message
    if (error.message.includes('Could not extract') || error.message.includes('No actionable tasks')) {
      throw new Error(error.message);
    }
    throw new Error('Unable to extract tasks from your note. The content may not contain clear action items. Try rephrasing with specific tasks.');
  }
}
