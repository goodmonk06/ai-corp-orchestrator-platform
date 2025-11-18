import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { createLogger } from './logger';

const logger = createLogger('http-client');

export class HttpClient {
  private client: AxiosInstance;

  constructor(baseURL: string, config?: AxiosRequestConfig) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      ...config,
    });

    this.client.interceptors.request.use((config) => {
      logger.debug({ url: config.url, method: config.method }, 'HTTP request');
      return config;
    });

    this.client.interceptors.response.use(
      (response) => {
        logger.debug(
          { url: response.config.url, status: response.status },
          'HTTP response'
        );
        return response;
      },
      (error) => {
        logger.error(
          {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
          },
          'HTTP error'
        );
        throw error;
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

// External service clients
export class VectorKnowledgeClient extends HttpClient {
  constructor() {
    super(process.env.VECTOR_KNOWLEDGE_API_URL || 'http://localhost:8001', {
      headers: {
        Authorization: `Bearer ${process.env.VECTOR_KNOWLEDGE_API_KEY || ''}`,
      },
    });
  }

  async search(query: string, limit = 10) {
    return this.post('/search', { query, limit });
  }

  async indexDocument(document: { id: string; content: string; metadata?: any }) {
    return this.post('/index', document);
  }
}

export class AutomationRecipeClient extends HttpClient {
  constructor() {
    super(process.env.AUTOMATION_RECIPES_API_URL || 'http://localhost:8002', {
      headers: {
        Authorization: `Bearer ${process.env.AUTOMATION_RECIPES_API_KEY || ''}`,
      },
    });
  }

  async listRecipes() {
    return this.get('/recipes');
  }

  async executeRecipe(recipeId: string, params: any) {
    return this.post(`/recipes/${recipeId}/execute`, params);
  }
}
