import { NextResponse } from 'next/server';

/**
 * GET /api/foods/recent
 * Returns recent foods for the current user.
 *
 * NOTE: For MVP, recent foods are stored in localStorage (client-side).
 * This endpoint exists for future migration to server-side storage.
 * Currently returns empty array - the FoodSearchAutocomplete component
 * handles localStorage retrieval directly.
 */
export async function GET() {
  // For MVP, recent foods are stored in localStorage on the client
  // This endpoint is a placeholder for future server-side storage
  // The client-side component handles localStorage retrieval directly

  return NextResponse.json({
    foods: [],
    source: 'placeholder', // Indicates this is the MVP placeholder
  });
}
