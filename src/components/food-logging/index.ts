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
export type { MealSectionProps, MealType, MealSectionFoodResult, RecipeWithIngredients } from './MealSection';

export { AIParseResult } from './AIParseResult';
export type { AIParseResultProps, ParsedFoodItem } from './AIParseResult';

export { FoodEditModal } from './FoodEditModal';
export type { FoodEditModalProps, FoodEditData } from './FoodEditModal';

export { RecipePanel } from './RecipePanel';
export type { RecipePanelProps, RecipeData } from './RecipePanel';

export { RecipeEditor } from './RecipeEditor';
export type { RecipeEditorProps, RecipeEditData, RecipeIngredient } from './RecipeEditor';

export { MyRecipesSidebar } from './MyRecipesSidebar';
export type { MyRecipesSidebarProps, Recipe } from './MyRecipesSidebar';

export { CreateRecipeModal } from './CreateRecipeModal';
export type { CreateRecipeModalProps, RecipeIngredient as CreateRecipeIngredient } from './CreateRecipeModal';

export { DateMenu } from './DateMenu';
export type { DateMenuProps } from './DateMenu';

export { CopyDayModal } from './CopyDayModal';
export type { CopyDayModalProps } from './CopyDayModal';

export { DatePickerModal } from './DatePickerModal';
export type { DatePickerModalProps } from './DatePickerModal';

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
