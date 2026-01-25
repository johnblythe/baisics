// Layout components for food logging
export { MobileLayout } from './MobileLayout';
export type { MobileLayoutProps, RecipeItem as MobileRecipeItem, MealData as MobileMealData } from './MobileLayout';

export { DesktopLayout } from './DesktopLayout';
export type { DesktopLayoutProps, RecipeItem as DesktopRecipeItem, MealData as DesktopMealData } from './DesktopLayout';

// Re-export shared types with unified names
export type { RecipeItem, MealData } from './MobileLayout';
