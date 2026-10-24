/**
 * LifeSync AI - Semantic Design Tokens
 * 
 * Single Source of Truth (SSOT) for nutrition, health metrics, and theme styling tokens.
 * Follows Open/Closed Principle and strict TypeScript typing.
 */

export type MacroNutrientType = 'CALORIES' | 'PROTEIN' | 'CARBS' | 'FAT';

export interface MacroColorToken {
  id: MacroNutrientType;
  label: string;
  shortLabel: string;
  unit: string;
  hex: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  barColor: string;
  gradientClass: string;
  cardBgClass: string;
  focusRingClass: string;
  chartGradientId: string;
}

export const NUTRITION_TOKENS: Record<MacroNutrientType, MacroColorToken> = {
  CALORIES: {
    id: 'CALORIES',
    label: 'Tổng Calories',
    shortLabel: 'Calories',
    unit: 'kcal',
    hex: '#F97316',
    bgClass: 'bg-orange-50',
    borderClass: 'border-orange-200/60',
    textClass: 'text-orange-600',
    barColor: '#F97316',
    gradientClass: 'from-orange-500 to-amber-500',
    cardBgClass: 'bg-orange-50/60 border border-orange-200/80',
    focusRingClass: 'focus:ring-orange-500',
    chartGradientId: 'colorCalories',
  },
  PROTEIN: {
    id: 'PROTEIN',
    label: 'Protein (Đạm)',
    shortLabel: 'Protein',
    unit: 'g',
    hex: '#8B5CF6',
    bgClass: 'bg-purple-50',
    borderClass: 'border-purple-200/60',
    textClass: 'text-purple-600',
    barColor: '#8B5CF6',
    gradientClass: 'from-purple-500 to-indigo-500',
    cardBgClass: 'bg-purple-50/60 border border-purple-200/80',
    focusRingClass: 'focus:ring-purple-500',
    chartGradientId: 'colorProtein',
  },
  CARBS: {
    id: 'CARBS',
    label: 'Carbs (Tinh bột)',
    shortLabel: 'Carbs',
    unit: 'g',
    hex: '#10B981',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200/60',
    textClass: 'text-emerald-600',
    barColor: '#10B981',
    gradientClass: 'from-emerald-500 to-teal-500',
    cardBgClass: 'bg-emerald-50/60 border border-emerald-200/80',
    focusRingClass: 'focus:ring-emerald-500',
    chartGradientId: 'colorCarbs',
  },
  FAT: {
    id: 'FAT',
    label: 'Fat (Chất béo)',
    shortLabel: 'Fat',
    unit: 'g',
    hex: '#EF4444',
    bgClass: 'bg-rose-50',
    borderClass: 'border-rose-200/60',
    textClass: 'text-rose-600',
    barColor: '#EF4444',
    gradientClass: 'from-rose-500 to-pink-500',
    cardBgClass: 'bg-rose-50/60 border border-rose-200/80',
    focusRingClass: 'focus:ring-rose-500',
    chartGradientId: 'colorFat',
  },
} as const;

/**
 * Helper retrieval functions ensuring strict type-safety
 */
export const getMacroToken = (type: MacroNutrientType): MacroColorToken => NUTRITION_TOKENS[type];

export const getMacroColor = (type: MacroNutrientType): string => NUTRITION_TOKENS[type].barColor;

