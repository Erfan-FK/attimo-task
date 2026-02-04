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
    systemPrompt: `You are an expert summarization assistant. Your task is to create concise, actionable summaries.

RULES:
- Return exactly 5 bullet points (no more, no less)
- Each bullet point should be 1-2 sentences maximum
- Focus on key facts, decisions, and action items
- End with exactly one "Key Takeaway:" sentence
- Use plain text only (no markdown, no formatting)
- Be objective and factual

OUTPUT FORMAT:
• [First main point]
• [Second main point]
• [Third main point]
• [Fourth main point]
• [Fifth main point]

Key Takeaway: [One sentence summary]`,
    userPrompt: (content: string) => `Summarize the following note according to the rules above:\n\n${content}`,
  },
  improve: {
    systemPrompt: `You are a professional writing assistant specializing in clarity and conciseness.

RULES:
- Fix all grammar, spelling, and punctuation errors
- Improve sentence structure and flow
- Remove redundancy and filler words
- Maintain the original meaning and tone
- Keep length within ±20% of original
- Use active voice where possible
- Preserve technical terms and proper nouns
- Return ONLY the improved text, no explanations`,
    userPrompt: (content: string) => `Improve the following text according to the rules above:\n\n${content}`,
  },
  extract_tasks: {
    systemPrompt: `You are a task extraction specialist. Extract clear, actionable tasks from any text.

RULES:
- Identify action items, to-dos, and commitments
- Each task must start with an action verb (e.g., "Call", "Review", "Send")
- Keep tasks concise (5-10 words maximum)
- Extract maximum 10 most important tasks
- Ignore vague or non-actionable items
- Return ONLY a valid JSON array of strings
- No explanations, no markdown, just JSON

GOOD EXAMPLES:
["Call John about project update", "Review Q4 budget proposal", "Send meeting notes to team"]

BAD EXAMPLES:
["Meeting", "Important stuff", "Things to remember"]`,
    userPrompt: (content: string) => `Extract actionable tasks from the following note. Return a JSON array:\n\n${content}`,
  },
};

export async function generateAIResponse(action: AIAction, content: string): Promise<string> {
  // Validate API key
  if (!groq) {
    throw new Error('Groq API key not configured. Please set GROQ_API_KEY in environment variables. Get your free key at https://console.groq.com/keys');
  }

  // Validate input content
  if (!content || content.trim().length === 0) {
    throw new Error('Content cannot be empty. Please provide text to process.');
  }

  // Enforce content length limits (Groq has token limits)
  const MAX_CONTENT_LENGTH = 10000; // ~2500 tokens
  if (content.length > MAX_CONTENT_LENGTH) {
    throw new Error(`Content too long (${content.length} chars). Maximum allowed is ${MAX_CONTENT_LENGTH} characters.`);
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
