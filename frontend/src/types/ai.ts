/**
 * Data contracts and DTO types for AI Vision and Heartcare features.
 * Matches backend DTOs in com.lifesync.dto.ai.
 */

export interface NutritionMacros {
  protein: number;
  carbs: number;
  fat: number;
  sodium: number;
}

export interface FoodScanResponse {
  isFood: boolean;
  foodName: string;
  portion: string;
  calories: number;
  confidence: number;
  macros: NutritionMacros;
  ingredients: string[];
  heartHealthTip: string;
  healthScore: number;
}

export interface AiChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface AiChatRequest {
  message: string;
  history?: {
    role: string;
    content: string;
  }[];
}

export interface AiChatResponse {
  response: string;
  heartcareScore?: number;
  actionableTips?: string[];
  contextUsed?: string[];
}

export interface PromptSuggestion {
  id: string;
  title: string;
  prompt: string;
  category: 'nutrition' | 'heart' | 'schedule' | 'general';
}
