import { useEffect } from 'react';

/**
 * Stack of active Escape handlers — only the topmost modal closes on Escape.
 * Each useEscapeKey call pushes/pops from this stack. The single document
 * listener invokes only the last (topmost) handler.
 */
const escapeStack: (() => void)[] = [];
let listenerBound = false;

function ensureGlobalListener() {
  if (listenerBound) return;
  listenerBound = true;
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && escapeStack.length > 0) {
      escapeStack[escapeStack.length - 1]();
    }
  });
}

/**
 * Close a modal/overlay when user presses Escape.
 * Only the topmost (most recently mounted) active handler fires.
 */
export function useEscapeKey(onClose: (() => void) | undefined, active = true) {
  useEffect(() => {
    if (!active || !onClose) return;
    ensureGlobalListener();
    escapeStack.push(onClose);
    return () => {
      const idx = escapeStack.lastIndexOf(onClose);
      if (idx !== -1) escapeStack.splice(idx, 1);
    };
  }, [onClose, active]);
}
