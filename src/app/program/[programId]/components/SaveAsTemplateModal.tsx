'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface SaveAsTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId: string;
  programName: string;
  onSuccess?: () => void;
}

export function SaveAsTemplateModal({
  isOpen,
  onClose,
  programId,
  programName,
  onSuccess,
}: SaveAsTemplateModalProps) {
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/programs/${programId}/promote-template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save as template');
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <h3 className="text-lg font-semibold text-[#0F172A]">Save as Template</h3>
          <button
            onClick={onClose}
            className="p-1 text-[#94A3B8] hover:text-[#0F172A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          <p className="text-[#64748B]">
            Save <span className="font-medium text-[#0F172A]">&quot;{programName}&quot;</span> as a
            reusable template. You can assign it to clients or use it as a starting point for
            new programs.
          </p>

          {/* Public toggle */}
          <label className="flex items-start gap-3 p-3 rounded-lg border border-[#E2E8F0] hover:border-[#FF6B6B] cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-[#FF6B6B] border-[#E2E8F0] rounded focus:ring-[#FF6B6B]"
            />
            <div>
              <span className="font-medium text-[#0F172A]">Make public</span>
              <p className="text-sm text-[#64748B] mt-0.5">
                Allow other users to discover and clone this template from the library.
              </p>
            </div>
          </label>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E2E8F0]">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save as Template'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
