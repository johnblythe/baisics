'use client';

import { useState, useCallback, useRef } from 'react';
import {
  type Sex,
  type BodyFatEstimate,
  VISUAL_REFERENCES,
  createEstimate,
  generateCTACopy,
} from '@/utils/bodyFat';

export type EstimatorMode = 'photo' | 'visual';

export interface BodyFatEstimatorProps {
  /** Initial mode to display */
  initialMode?: EstimatorMode;
  /** Called when estimate is generated */
  onEstimate?: (estimate: BodyFatEstimate) => void;
  /** Called when user submits CTA */
  onCtaSubmit?: (email: string, estimate: BodyFatEstimate) => void;
  /** Whether to show the CTA section */
  showCta?: boolean;
  /** Custom CTA content */
  ctaContent?: {
    headline?: string;
    subtext?: string;
    buttonText?: string;
  };
  /** Whether this is embedded in dashboard (affects styling) */
  embedded?: boolean;
}

export function BodyFatEstimator({
  initialMode = 'photo',
  onEstimate,
  onCtaSubmit,
  showCta = true,
  ctaContent,
  embedded = false,
}: BodyFatEstimatorProps) {
  const [mode, setMode] = useState<EstimatorMode>(initialMode);
  const [sex, setSex] = useState<Sex>('male');
  const [estimate, setEstimate] = useState<BodyFatEstimate | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [multipleFilesNotice, setMultipleFilesNotice] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setEstimate(null);
    setMultipleFilesNotice(false);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image too large. Please use an image under 10MB.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setPreviewUrl(base64);

      // Start analysis
      setIsAnalyzing(true);
      try {
        const response = await fetch('/api/tools/body-fat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, sex }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Analysis failed');
        }

        if (!data.success) {
          setError(data.error || 'Could not analyze image');
          return;
        }

        setEstimate(data.estimate);
        onEstimate?.(data.estimate);
      } catch (err) {
        console.error('Analysis error:', err);
        setError(err instanceof Error ? err.message : 'Analysis failed');
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  }, [sex, onEstimate]);

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 1) {
      setMultipleFilesNotice(true);
    }

    processFile(files[0]);
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    if (files.length > 1) {
      setMultipleFilesNotice(true);
    }

    processFile(files[0]);
  }, [processFile]);

  const handleVisualSelect = useCallback((min: number, max: number) => {
    const newEstimate = createEstimate(min, max, sex, 'medium');
    setEstimate(newEstimate);
    onEstimate?.(newEstimate);
  }, [sex, onEstimate]);

  const handleCtaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !estimate) return;

    setIsSubmitting(true);
    try {
      onCtaSubmit?.(email, estimate);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetEstimator = () => {
    setEstimate(null);
    setPreviewUrl(null);
    setError(null);
    setMultipleFilesNotice(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const cta = estimate
    ? ctaContent || generateCTACopy(estimate, sex)
    : null;

  const containerClass = embedded
    ? ''
    : 'bg-[var(--color-gray-50)] rounded-2xl p-6 lg:p-8';

  return (
    <div className={containerClass}>
      {/* Sex Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-[var(--color-navy)] mb-2">
          Biological Sex
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(['male', 'female'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setSex(option);
                if (estimate) {
                  // Recalculate with new sex
                  const newEstimate = createEstimate(
                    estimate.lowEstimate,
                    estimate.highEstimate,
                    option,
                    estimate.confidence
                  );
                  setEstimate(newEstimate);
                  onEstimate?.(newEstimate);
                }
              }}
              className={`py-3 px-4 rounded-lg font-medium transition-all ${
                sex === option
                  ? 'bg-[var(--color-navy)] text-white'
                  : 'bg-white border border-[var(--color-gray-100)] text-[var(--color-gray-600)] hover:border-[var(--color-navy)]'
              }`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex rounded-lg bg-[var(--color-gray-100)] p-1 mb-6">
        <button
          type="button"
          onClick={() => setMode('photo')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${
            mode === 'photo'
              ? 'bg-white text-[var(--color-navy)] shadow-sm'
              : 'text-[var(--color-gray-600)]'
          }`}
        >
          Photo Upload
        </button>
        <button
          type="button"
          onClick={() => setMode('visual')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${
            mode === 'visual'
              ? 'bg-white text-[var(--color-navy)] shadow-sm'
              : 'text-[var(--color-gray-600)]'
          }`}
        >
          Visual Compare
        </button>
      </div>

      {/* Photo Upload Mode */}
      {mode === 'photo' && (
        <div>
          {!previewUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-[var(--color-coral)] bg-[var(--color-coral-light)]/30'
                  : 'border-[var(--color-gray-400)] hover:border-[var(--color-coral)]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                className="hidden"
              />
              <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-coral-light)] rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-[var(--color-coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-[var(--color-navy)] mb-1">
                {isDragging ? 'Drop your photo here' : 'Upload a photo'}
              </p>
              <p className="text-sm text-[var(--color-gray-600)] mb-4">
                Drag & drop or click to select a front-facing torso photo
              </p>
              <p className="text-xs text-[var(--color-gray-400)]">
                Your photo is analyzed privately and never stored
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {multipleFilesNotice && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-amber-700 text-sm">
                    Multiple photos detected — using the first one only.
                  </p>
                </div>
              )}
              <div className="relative rounded-xl overflow-hidden bg-[var(--color-navy)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Your photo"
                  className="w-full max-h-80 object-contain"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-[var(--color-navy)]/80 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-[var(--color-coral)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-white font-medium">Analyzing...</p>
                    </div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={resetEstimator}
                className="w-full py-2 text-sm font-medium text-[var(--color-gray-600)] hover:text-[var(--color-navy)] transition-colors"
              >
                Use a different photo
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
              <button
                type="button"
                onClick={resetEstimator}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Visual Comparison Mode */}
      {mode === 'visual' && (
        <div>
          <p className="text-sm text-[var(--color-gray-600)] mb-4">
            Select the image that most closely matches your physique:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {VISUAL_REFERENCES[sex].map((ref) => (
              <button
                key={ref.range}
                type="button"
                onClick={() => handleVisualSelect(ref.min, ref.max)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  estimate &&
                  estimate.lowEstimate === ref.min &&
                  estimate.highEstimate === ref.max
                    ? 'border-[var(--color-coral)] bg-[var(--color-coral-light)]'
                    : 'border-[var(--color-gray-100)] bg-white hover:border-[var(--color-coral)]'
                }`}
              >
                <div className="font-mono text-lg font-bold text-[var(--color-navy)] mb-1">
                  {ref.range}
                </div>
                <div className="text-sm font-medium text-[var(--color-gray-600)] mb-2">
                  {ref.description}
                </div>
                <ul className="text-xs text-[var(--color-gray-400)] space-y-0.5">
                  {ref.visualCues.slice(0, 2).map((cue, i) => (
                    <li key={i}>• {cue}</li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {estimate && (
        <div className="mt-6 bg-[var(--color-navy)] rounded-2xl p-6 text-white">
          <h3 className="text-lg font-bold mb-4">Your Estimated Body Fat</h3>

          <div className="text-center mb-6">
            <p className="font-mono text-5xl font-bold text-[var(--color-coral)]">
              {estimate.lowEstimate}-{estimate.highEstimate}%
            </p>
            <p className="text-[var(--color-gray-400)] text-sm mt-1">
              Midpoint: {estimate.midpoint}%
              <span className="ml-2 text-[var(--color-coral)]">
                ({estimate.confidence === 'high' ? '±2%' : estimate.confidence === 'medium' ? '±4%' : '±5%'})
              </span>
            </p>
          </div>

          {/* Error Bar Visualization */}
          <div className="mb-6">
            <div className="relative h-8 bg-[var(--color-navy-light)] rounded-lg overflow-hidden">
              {/* Scale markers */}
              <div className="absolute inset-0 flex justify-between px-2 items-center pointer-events-none">
                {[0, 10, 20, 30, 40].map((mark) => (
                  <div key={mark} className="flex flex-col items-center">
                    <div className="w-px h-2 bg-[var(--color-gray-600)]" />
                    <span className="text-[10px] text-[var(--color-gray-400)] mt-0.5">{mark}%</span>
                  </div>
                ))}
              </div>
              {/* Range bar */}
              <div
                className="absolute top-1 bottom-1 bg-[var(--color-coral)] rounded-md opacity-80"
                style={{
                  left: `${(estimate.lowEstimate / 40) * 100}%`,
                  width: `${((estimate.highEstimate - estimate.lowEstimate) / 40) * 100}%`,
                }}
              />
              {/* Midpoint marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white"
                style={{
                  left: `${(estimate.midpoint / 40) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-[var(--color-navy-light)] rounded-lg">
              <p className="text-xs text-[var(--color-gray-400)] mb-1">Category</p>
              <p className="font-medium capitalize">
                {estimate.category.replace('_', ' ')}
              </p>
            </div>
            <div className="p-3 bg-[var(--color-navy-light)] rounded-lg">
              <p className="text-xs text-[var(--color-gray-400)] mb-1">Suggested Goal</p>
              <p className="font-medium capitalize">
                {estimate.recommendation === 'cut' && 'Fat loss'}
                {estimate.recommendation === 'bulk' && 'Lean bulk'}
                {estimate.recommendation === 'recomp' && 'Recomp'}
                {estimate.recommendation === 'maintain' && 'Maintain'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      {showCta && estimate && cta && (
        <div className="mt-6 bg-[var(--color-coral-light)] rounded-2xl p-6 border-2 border-[var(--color-coral)]">
          <h3 className="text-xl font-bold text-[var(--color-navy)] mb-2">
            {cta.headline}
          </h3>
          <p className="text-[var(--color-gray-600)] mb-4">
            {cta.subtext}
          </p>

          <form onSubmit={handleCtaSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 rounded-lg border border-[var(--color-coral)]/30 focus:border-[var(--color-coral)] focus:ring-2 focus:ring-[var(--color-coral)]/20 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 text-lg font-bold text-white bg-[var(--color-coral)] rounded-xl hover:bg-[var(--color-coral-dark)] transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Loading...' : cta.buttonText}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default BodyFatEstimator;
