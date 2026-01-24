// Shared UI components for food logging
export { MacroProgressBar } from './MacroProgressBar';
export type { MacroProgressBarProps, MacroTotals, MacroTargets } from './MacroProgressBar';

export { QuickInput } from './QuickInput';
export type { QuickInputProps } from './QuickInput';

export { QuickPills } from './QuickPills';
export type { QuickPillsProps, QuickFoodItem } from './QuickPills';

export { WeeklyStrip } from './WeeklyStrip';
export type { WeeklyStripProps, WeeklyDayData } from './WeeklyStrip';

export { FoodLogItem } from './FoodLogItem';
export type { FoodLogItemProps, FoodLogItemData } from './FoodLogItem';

export { MealSection } from './MealSection';
export type { MealSectionProps, MealType } from './MealSection';

export { AIParseResult } from './AIParseResult';
export type { AIParseResultProps, ParsedFoodItem } from './AIParseResult';

export { RecipePanel } from './RecipePanel';
export type { RecipePanelProps, RecipeData } from './RecipePanel';

export { RecipeEditor } from './RecipeEditor';
export type { RecipeEditorProps, RecipeEditData, RecipeIngredient } from './RecipeEditor';

// USDA Food Search
export { USDAFoodSearch } from './USDAFoodSearch';
export type { USDAFoodSearchProps, USDAFoodResult } from './USDAFoodSearch';

// Page orchestrator
export { FoodLogPage } from './FoodLogPage';
export type { FoodLogPageProps } from './FoodLogPage';

// Layout components
export { MobileLayout, DesktopLayout } from './layouts';
export type {
  MobileLayoutProps,
  DesktopLayoutProps,
  RecipeItem,
  MealData,
} from './layouts';
