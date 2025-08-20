import OpenAI from 'openai';
import { logger } from './logger';

// Initialize OpenAI client with error handling
let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      logger.error('OpenAI API key not found in environment variables', {} as Record<string, unknown>);
      throw new Error('OpenAI API key not configured');
    }
    
    openaiClient = new OpenAI({
      apiKey: apiKey,
    });
    
    logger.debug('OpenAI client initialized', {} as Record<string, unknown>);
  }
  
  return openaiClient;
}

// Cost-efficient model selection
export const OPENAI_MODEL = 'gpt-4o-mini' as const;

// Configuration for transcript analysis
export const OPENAI_CONFIG = {
  model: OPENAI_MODEL,
  max_tokens: 300, // Limit tokens for cost efficiency
  temperature: 0.1, // Low temperature for consistent parsing
  response_format: { type: 'json_object' as const }
} as const;