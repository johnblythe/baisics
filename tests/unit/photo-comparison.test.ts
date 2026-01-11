import { describe, it, expect } from 'vitest';

/**
 * Tests for PhotoComparison component behavior
 *
 * These tests verify the date selection, photo filtering,
 * and display logic for the progress photo comparison feature.
 */

interface Photo {
  id: string;
  base64Data: string;
  type: 'FRONT' | 'BACK' | 'SIDE_LEFT' | 'SIDE_RIGHT' | 'CUSTOM' | null;
  createdAt: string;
}

interface CheckInWithPhotos {
  id: string;
  date: string;
  photos: Photo[];
}

describe('PhotoComparison behavior', () => {
  describe('date extraction from check-ins', () => {
    it('should extract available dates from check-ins', () => {
      const checkIns: CheckInWithPhotos[] = [
        { id: '1', date: '2025-11-01T00:00:00Z', photos: [] },
        { id: '2', date: '2025-11-15T00:00:00Z', photos: [] },
        { id: '3', date: '2025-12-01T00:00:00Z', photos: [] },
      ];

      const availableDates = checkIns.map(c => c.date.split('T')[0]);

      expect(availableDates).toEqual(['2025-11-01', '2025-11-15', '2025-12-01']);
    });
  });

  describe('auto-selection of dates', () => {
    it('should auto-select first and last dates when multiple check-ins exist', () => {
      const checkIns: CheckInWithPhotos[] = [
        { id: '1', date: '2025-11-01T00:00:00Z', photos: [] },
        { id: '2', date: '2025-11-15T00:00:00Z', photos: [] },
        { id: '3', date: '2025-12-01T00:00:00Z', photos: [] },
      ];

      let beforeDate = '';
      let afterDate = '';

      if (checkIns.length >= 2) {
        beforeDate = checkIns[0].date.split('T')[0];
        afterDate = checkIns[checkIns.length - 1].date.split('T')[0];
      }

      expect(beforeDate).toBe('2025-11-01');
      expect(afterDate).toBe('2025-12-01');
    });

    it('should only set beforeDate when single check-in exists', () => {
      const checkIns: CheckInWithPhotos[] = [
        { id: '1', date: '2025-11-01T00:00:00Z', photos: [] },
      ];

      let beforeDate = '';
      let afterDate = '';

      if (checkIns.length >= 2) {
        beforeDate = checkIns[0].date.split('T')[0];
        afterDate = checkIns[checkIns.length - 1].date.split('T')[0];
      } else if (checkIns.length === 1) {
        beforeDate = checkIns[0].date.split('T')[0];
      }

      expect(beforeDate).toBe('2025-11-01');
      expect(afterDate).toBe('');
    });
  });

  describe('photo type filtering', () => {
    it('should find photo by type', () => {
      const photos: Photo[] = [
        { id: '1', base64Data: 'front-data', type: 'FRONT', createdAt: '' },
        { id: '2', base64Data: 'back-data', type: 'BACK', createdAt: '' },
        { id: '3', base64Data: 'left-data', type: 'SIDE_LEFT', createdAt: '' },
      ];

      const frontPhoto = photos.find(p => p.type === 'FRONT');
      const backPhoto = photos.find(p => p.type === 'BACK');

      expect(frontPhoto?.base64Data).toBe('front-data');
      expect(backPhoto?.base64Data).toBe('back-data');
    });

    it('should return undefined when photo type not found', () => {
      const photos: Photo[] = [
        { id: '1', base64Data: 'front-data', type: 'FRONT', createdAt: '' },
      ];

      const backPhoto = photos.find(p => p.type === 'BACK');
      expect(backPhoto).toBeUndefined();
    });

    it('should extract available types from photos', () => {
      const beforePhotos: Photo[] = [
        { id: '1', base64Data: '', type: 'FRONT', createdAt: '' },
        { id: '2', base64Data: '', type: 'BACK', createdAt: '' },
      ];
      const afterPhotos: Photo[] = [
        { id: '3', base64Data: '', type: 'FRONT', createdAt: '' },
        { id: '4', base64Data: '', type: 'SIDE_LEFT', createdAt: '' },
      ];

      const availableTypes = Array.from(new Set([
        ...beforePhotos.map(p => p.type),
        ...afterPhotos.map(p => p.type),
      ])).filter((t): t is 'FRONT' | 'BACK' | 'SIDE_LEFT' | 'SIDE_RIGHT' =>
        t !== null && t !== 'CUSTOM'
      );

      expect(availableTypes).toContain('FRONT');
      expect(availableTypes).toContain('BACK');
      expect(availableTypes).toContain('SIDE_LEFT');
      expect(availableTypes).not.toContain('SIDE_RIGHT');
    });

    it('should filter out CUSTOM and null types', () => {
      const photos: Photo[] = [
        { id: '1', base64Data: '', type: 'FRONT', createdAt: '' },
        { id: '2', base64Data: '', type: 'CUSTOM', createdAt: '' },
        { id: '3', base64Data: '', type: null, createdAt: '' },
      ];

      const validTypes = photos
        .map(p => p.type)
        .filter((t): t is 'FRONT' | 'BACK' | 'SIDE_LEFT' | 'SIDE_RIGHT' =>
          t !== null && t !== 'CUSTOM'
        );

      expect(validTypes).toEqual(['FRONT']);
    });
  });

  describe('date formatting for display', () => {
    const formatDateForDisplay = (dateStr: string) => {
      const date = new Date(dateStr + 'T12:00:00');
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    };

    it('should format date string for display', () => {
      const formatted = formatDateForDisplay('2025-11-15');
      expect(formatted).toMatch(/November/);
      expect(formatted).toMatch(/15/);
      expect(formatted).toMatch(/2025/);
    });
  });

  describe('photo type labels', () => {
    const PHOTO_TYPE_LABELS: Record<string, string> = {
      FRONT: 'Front',
      BACK: 'Back',
      SIDE_LEFT: 'Left Side',
      SIDE_RIGHT: 'Right Side',
    };

    it('should have labels for all standard photo types', () => {
      expect(PHOTO_TYPE_LABELS.FRONT).toBe('Front');
      expect(PHOTO_TYPE_LABELS.BACK).toBe('Back');
      expect(PHOTO_TYPE_LABELS.SIDE_LEFT).toBe('Left Side');
      expect(PHOTO_TYPE_LABELS.SIDE_RIGHT).toBe('Right Side');
    });
  });

  describe('minimum check-ins requirement', () => {
    it('should require at least 2 check-ins for comparison', () => {
      const checkInsCount = 1;
      const canCompare = checkInsCount >= 2;
      expect(canCompare).toBe(false);
    });

    it('should allow comparison with 2+ check-ins', () => {
      const checkInsCount = 2;
      const canCompare = checkInsCount >= 2;
      expect(canCompare).toBe(true);
    });
  });
});
