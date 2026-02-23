-- Mutual exclusivity constraint: prevent both recipeId AND quickFoodId being set
ALTER TABLE food_staples
ADD CONSTRAINT chk_food_staple_single_source
CHECK (NOT (recipe_id IS NOT NULL AND quick_food_id IS NOT NULL));

-- Fix existing FoodLogEntry recipe FK to SET NULL on delete (pre-existing bug: delete recipe → 500)
ALTER TABLE food_log_entries
DROP CONSTRAINT IF EXISTS food_log_entries_recipe_id_fkey;

ALTER TABLE food_log_entries
ADD CONSTRAINT food_log_entries_recipe_id_fkey
FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE SET NULL;
