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
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  disclaimer?: string;
  timestamp?: string;
}

export interface AiChatRequest {
  message: string;
}

export interface AiChatResponse {
  reply: string;
  disclaimer?: string;
  timestamp?: string;
}

export interface PromptSuggestion {
  id: string;
  title: string;
  prompt: string;
  category: string;
  icon?: string;
}
