'use client';

interface MacroDisplayProps {
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
  compact?: boolean;
}

export function MacroDisplay({ protein, carbs, fats, calories, compact = false }: MacroDisplayProps) {
  // Calculate percentages (by calories: P=4cal/g, C=4cal/g, F=9cal/g)
  const proteinCals = protein * 4;
  const carbsCals = carbs * 4;
  const fatsCals = fats * 9;
  const totalMacroCals = proteinCals + carbsCals + fatsCals;

  // Caloric percentages for donut
  const proteinPct = Math.round((proteinCals / totalMacroCals) * 100);
  const carbsPct = Math.round((carbsCals / totalMacroCals) * 100);
  const fatsPct = 100 - proteinPct - carbsPct; // Ensure adds to 100

  // SVG donut chart calculations
  const size = compact ? 72 : 88;
  const strokeWidth = compact ? 8 : 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate stroke dasharray for each segment
  const proteinDash = (proteinPct / 100) * circumference;
  const carbsDash = (carbsPct / 100) * circumference;
  const fatsDash = (fatsPct / 100) * circumference;

  // Calculate rotation for each segment
  const proteinRotation = -90; // Start at top
  const carbsRotation = proteinRotation + (proteinPct * 3.6);
  const fatsRotation = carbsRotation + (carbsPct * 3.6);

  if (compact) {
    return (
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-[#94A3B8] uppercase tracking-wider" style={{ fontFamily: "'Space Mono', monospace" }}>
          Daily Macros
        </h2>

        <div className="flex items-center gap-4">
          {/* Mini Donut */}
          <div className="relative flex-shrink-0">
            <svg width={size} height={size} className="transform -rotate-90">
              {/* Background ring */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#F1F5F9"
                strokeWidth={strokeWidth}
              />
              {/* Protein segment (coral) */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#FF6B6B"
                strokeWidth={strokeWidth}
                strokeDasharray={`${proteinDash} ${circumference}`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
              {/* Carbs segment (navy) */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#0F172A"
                strokeWidth={strokeWidth}
                strokeDasharray={`${carbsDash} ${circumference}`}
                strokeDashoffset={-proteinDash}
                className="transition-all duration-500"
              />
              {/* Fats segment (gray) */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#94A3B8"
                strokeWidth={strokeWidth}
                strokeDasharray={`${fatsDash} ${circumference}`}
                strokeDashoffset={-(proteinDash + carbsDash)}
                className="transition-all duration-500"
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-[#0F172A] leading-none">{calories}</span>
              <span className="text-[10px] text-[#94A3B8] uppercase tracking-wide">kcal</span>
            </div>
          </div>

          {/* Macro values */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FF6B6B]" />
              <span className="text-sm text-[#475569]">P</span>
              <span className="text-sm font-bold text-[#0F172A]" style={{ fontFamily: "'Space Mono', monospace" }}>{protein}g</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#0F172A]" />
              <span className="text-sm text-[#475569]">C</span>
              <span className="text-sm font-bold text-[#0F172A]" style={{ fontFamily: "'Space Mono', monospace" }}>{carbs}g</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#94A3B8]" />
              <span className="text-sm text-[#475569]">F</span>
              <span className="text-sm font-bold text-[#0F172A]" style={{ fontFamily: "'Space Mono', monospace" }}>{fats}g</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full size variant (for ProgramDisplay)
  return (
    <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9]">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Donut */}
        <div className="relative flex-shrink-0 mx-auto sm:mx-0">
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#F1F5F9"
              strokeWidth={strokeWidth}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#FF6B6B"
              strokeWidth={strokeWidth}
              strokeDasharray={`${proteinDash} ${circumference}`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#0F172A"
              strokeWidth={strokeWidth}
              strokeDasharray={`${carbsDash} ${circumference}`}
              strokeDashoffset={-proteinDash}
              className="transition-all duration-500"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#94A3B8"
              strokeWidth={strokeWidth}
              strokeDasharray={`${fatsDash} ${circumference}`}
              strokeDashoffset={-(proteinDash + carbsDash)}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-[#0F172A] leading-none">{calories}</span>
            <span className="text-[10px] text-[#94A3B8] uppercase tracking-wide">kcal</span>
          </div>
        </div>

        {/* Macro details */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-3 h-3 rounded-full bg-[#FF6B6B]" />
              <span className="text-sm text-[#475569]">Protein</span>
            </div>
            <span className="text-sm font-bold text-[#0F172A]" style={{ fontFamily: "'Space Mono', monospace" }}>{protein}g</span>
            <span className="text-xs text-[#94A3B8] w-8">{proteinPct}%</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-3 h-3 rounded-full bg-[#0F172A]" />
              <span className="text-sm text-[#475569]">Carbs</span>
            </div>
            <span className="text-sm font-bold text-[#0F172A]" style={{ fontFamily: "'Space Mono', monospace" }}>{carbs}g</span>
            <span className="text-xs text-[#94A3B8] w-8">{carbsPct}%</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-3 h-3 rounded-full bg-[#94A3B8]" />
              <span className="text-sm text-[#475569]">Fats</span>
            </div>
            <span className="text-sm font-bold text-[#0F172A]" style={{ fontFamily: "'Space Mono', monospace" }}>{fats}g</span>
            <span className="text-xs text-[#94A3B8] w-8">{fatsPct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
