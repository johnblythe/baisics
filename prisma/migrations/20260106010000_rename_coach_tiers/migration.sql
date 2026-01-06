-- Rename CoachTier enum values: PRO → SWOLE, MAX → YOKED
ALTER TYPE "CoachTier" RENAME VALUE 'PRO' TO 'SWOLE';
ALTER TYPE "CoachTier" RENAME VALUE 'MAX' TO 'YOKED';
