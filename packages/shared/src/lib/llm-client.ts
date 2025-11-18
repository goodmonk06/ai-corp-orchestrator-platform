import OpenAI from 'openai';
import { createLogger } from './logger';

const logger = createLogger('llm-client');

export interface LLMConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

export class LLMClient {
  private client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async chat(messages: LLMMessage[], config: LLMConfig = {}): Promise<LLMResponse> {
    const {
      model = 'gpt-4-turbo-preview',
      temperature = 0.7,
      maxTokens = 2000,
      systemPrompt,
    } = config;

    try {
      const finalMessages: LLMMessage[] = systemPrompt
        ? [{ role: 'system', content: systemPrompt }, ...messages]
        : messages;

      logger.info({ model, messageCount: finalMessages.length }, 'Sending chat request to LLM');

      const response = await this.client.chat.completions.create({
        model,
        messages: finalMessages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
        temperature,
        max_tokens: maxTokens,
      });

      const content = response.choices[0]?.message?.content || '';
      const usage = response.usage;

      logger.info(
        {
          usage,
          contentLength: content.length,
        },
        'Received LLM response'
      );

      return {
        content,
        usage: usage
          ? {
              promptTokens: usage.prompt_tokens,
              completionTokens: usage.completion_tokens,
              totalTokens: usage.total_tokens,
            }
          : undefined,
        model: response.model,
      };
    } catch (error) {
      logger.error({ error }, 'LLM request failed');
      throw error;
    }
  }

  async complete(prompt: string, config: LLMConfig = {}): Promise<LLMResponse> {
    return this.chat([{ role: 'user', content: prompt }], config);
  }
}

export const createLLMClient = (apiKey?: string) => new LLMClient(apiKey);
