import axiosClient from './axiosClient';
import type { ApiResponse } from './mealApi';
import type {
  FoodScanResponse,
  AiChatRequest,
  AiChatResponse,
  PromptSuggestion,
} from '../types/ai';

export const aiApi = {
  /**
   * Uploads an image file to Gemini Flash Multimodal Vision Scanner
   * to extract meal nutrition, portion size, and cardiovascular tips.
   */
  scanFood: (file: File): Promise<ApiResponse<FoodScanResponse>> => {
    const formData = new FormData();
    formData.append('file', file);

    return axiosClient.post('/ai/scan-food', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for AI vision processing
    });
  },

  /**
   * Chats with Heartcare & Lifestyle AI Companion with health context.
   */
  chat: (request: AiChatRequest): Promise<ApiResponse<AiChatResponse>> => {
    return axiosClient.post('/ai/chat', request);
  },

  /**
   * Retrieves quick prompt chips for UI interactions.
   */
  getSuggestedPrompts: (): Promise<ApiResponse<PromptSuggestion[]>> => {
    return axiosClient.get('/ai/suggested-prompts');
  },
};
