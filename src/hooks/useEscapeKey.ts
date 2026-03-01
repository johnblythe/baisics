import { useEffect } from 'react';

/**
 * Close a modal/overlay when user presses Escape.
 */
export function useEscapeKey(onClose: (() => void) | undefined, active = true) {
  useEffect(() => {
    if (!active || !onClose) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, active]);
}
