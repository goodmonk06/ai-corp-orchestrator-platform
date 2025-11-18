/**
 * AI Provider Adapter Interface
 *
 * Allows plugging in different LLM providers
 * (OpenAI, Anthropic, Azure OpenAI, Google AI, local models, etc.)
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
  functionCall?: {
    name: string;
    arguments: string;
  };
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  functions?: Array<{
    name: string;
    description: string;
    parameters: Record<string, any>;
  }>;
  functionCall?: 'none' | 'auto' | { name: string };
}

export interface ChatCompletionResponse {
  id: string;
  content: string;
  role: 'assistant';
  model: string;
  finishReason: 'stop' | 'length' | 'function_call' | 'content_filter';
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  functionCall?: {
    name: string;
    arguments: string;
  };
}

export interface EmbeddingRequest {
  input: string | string[];
  model?: string;
}

export interface EmbeddingResponse {
  embeddings: number[][];
  model: string;
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}

export interface IAIProviderAdapter {
  /**
   * Provider name/identifier
   */
  readonly name: string;

  /**
   * Get available models
   */
  getModels(): Promise<string[]>;

  /**
   * Generate chat completion
   */
  chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse>;

  /**
   * Generate embeddings
   */
  createEmbeddings(request: EmbeddingRequest): Promise<EmbeddingResponse>;

  /**
   * Stream chat completion (returns async iterator)
   */
  streamChatCompletion(
    request: ChatCompletionRequest
  ): AsyncIterableIterator<{
    delta: string;
    finishReason?: string;
  }>;

  /**
   * Verify provider configuration and API access
   */
  verify(): Promise<boolean>;

  /**
   * Get provider status and capabilities
   */
  getStatus(): Promise<{
    healthy: boolean;
    message?: string;
    capabilities?: {
      chat: boolean;
      embeddings: boolean;
      streaming: boolean;
      functions: boolean;
    };
  }>;
}

/**
 * OpenAI Provider Adapter
 */
export class OpenAIProviderAdapter implements IAIProviderAdapter {
  readonly name = 'openai';

  constructor(
    private config: {
      apiKey: string;
      organization?: string;
      baseURL?: string;
    }
  ) {}

  async getModels(): Promise<string[]> {
    // TODO: Fetch from OpenAI API
    return [
      'gpt-4-turbo-preview',
      'gpt-4',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
    ];
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    // TODO: Implement actual OpenAI API call
    console.log('[OpenAI] Chat completion request:', request);

    return {
      id: `chatcmpl-${Date.now()}`,
      content: 'Mock response from OpenAI adapter',
      role: 'assistant',
      model: request.model || 'gpt-4-turbo-preview',
      finishReason: 'stop',
      usage: {
        promptTokens: 50,
        completionTokens: 30,
        totalTokens: 80,
      },
    };
  }

  async createEmbeddings(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    // TODO: Implement actual OpenAI embeddings API call
    console.log('[OpenAI] Embeddings request:', request);

    const inputs = Array.isArray(request.input) ? request.input : [request.input];
    return {
      embeddings: inputs.map(() => new Array(1536).fill(0)),
      model: request.model || 'text-embedding-ada-002',
      usage: {
        promptTokens: 10,
        totalTokens: 10,
      },
    };
  }

  async *streamChatCompletion(request: ChatCompletionRequest) {
    // TODO: Implement streaming
    yield { delta: 'Mock ', finishReason: undefined };
    yield { delta: 'streaming ', finishReason: undefined };
    yield { delta: 'response', finishReason: 'stop' };
  }

  async verify(): Promise<boolean> {
    // TODO: Verify API key with a test request
    return !!this.config.apiKey;
  }

  async getStatus() {
    return {
      healthy: true,
      message: 'OpenAI adapter ready',
      capabilities: {
        chat: true,
        embeddings: true,
        streaming: true,
        functions: true,
      },
    };
  }
}

/**
 * Anthropic (Claude) Provider Adapter
 */
export class AnthropicProviderAdapter implements IAIProviderAdapter {
  readonly name = 'anthropic';

  constructor(
    private config: {
      apiKey: string;
      baseURL?: string;
    }
  ) {}

  async getModels(): Promise<string[]> {
    return [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
    ];
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    // TODO: Implement actual Anthropic API call
    console.log('[Anthropic] Chat completion request:', request);

    return {
      id: `msg-${Date.now()}`,
      content: 'Mock response from Anthropic adapter',
      role: 'assistant',
      model: request.model || 'claude-3-sonnet-20240229',
      finishReason: 'stop',
      usage: {
        promptTokens: 50,
        completionTokens: 30,
        totalTokens: 80,
      },
    };
  }

  async createEmbeddings(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    // Note: Anthropic doesn't provide embeddings directly
    throw new Error('Anthropic does not support embeddings');
  }

  async *streamChatCompletion(request: ChatCompletionRequest) {
    // TODO: Implement streaming
    yield { delta: 'Mock ', finishReason: undefined };
    yield { delta: 'streaming ', finishReason: undefined };
    yield { delta: 'from Claude', finishReason: 'stop' };
  }

  async verify(): Promise<boolean> {
    return !!this.config.apiKey;
  }

  async getStatus() {
    return {
      healthy: true,
      message: 'Anthropic adapter ready',
      capabilities: {
        chat: true,
        embeddings: false,
        streaming: true,
        functions: false, // Claude uses different approach
      },
    };
  }
}

/**
 * Azure OpenAI Provider Adapter
 */
export class AzureOpenAIProviderAdapter implements IAIProviderAdapter {
  readonly name = 'azure-openai';

  constructor(
    private config: {
      apiKey: string;
      endpoint: string;
      deploymentId: string;
      apiVersion?: string;
    }
  ) {}

  async getModels(): Promise<string[]> {
    return [this.config.deploymentId];
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    // TODO: Implement Azure OpenAI API call
    console.log('[Azure OpenAI] Chat completion request:', request);

    return {
      id: `chatcmpl-${Date.now()}`,
      content: 'Mock response from Azure OpenAI adapter',
      role: 'assistant',
      model: this.config.deploymentId,
      finishReason: 'stop',
      usage: {
        promptTokens: 50,
        completionTokens: 30,
        totalTokens: 80,
      },
    };
  }

  async createEmbeddings(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    // TODO: Implement Azure OpenAI embeddings
    console.log('[Azure OpenAI] Embeddings request:', request);

    const inputs = Array.isArray(request.input) ? request.input : [request.input];
    return {
      embeddings: inputs.map(() => new Array(1536).fill(0)),
      model: this.config.deploymentId,
      usage: {
        promptTokens: 10,
        totalTokens: 10,
      },
    };
  }

  async *streamChatCompletion(request: ChatCompletionRequest) {
    yield { delta: 'Mock streaming from Azure', finishReason: 'stop' };
  }

  async verify(): Promise<boolean> {
    return !!this.config.apiKey && !!this.config.endpoint;
  }

  async getStatus() {
    return {
      healthy: true,
      message: 'Azure OpenAI adapter ready',
      capabilities: {
        chat: true,
        embeddings: true,
        streaming: true,
        functions: true,
      },
    };
  }
}
