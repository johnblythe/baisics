'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createCheckIn } from './actions';
import { Camera, Scale, Ruler, Heart, FileText, Calendar, ChevronDown, ChevronUp, ImageIcon } from 'lucide-react';
import { PhotoComparison } from '@/components/PhotoComparison';

interface Photo {
  type: 'FRONT' | 'BACK' | 'SIDE_LEFT' | 'SIDE_RIGHT' | 'CUSTOM';
  file: File | null;
  base64Data?: string;
}

export interface CheckIn {
  id?: string;
  date: string;
  type?: 'initial' | 'progress' | 'end';
  weight: number | null;
  bodyFat: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  bicepLeft: number | null;
  bicepLeftFlex: number | null;
  bicepRight: number | null;
  bicepRightFlex: number | null;
  thighLeft: number | null;
  thighRight: number | null;
  calfLeft: number | null;
  calfRight: number | null;
  sleepHours: number | null;
  sleepQuality: number | null;
  energyLevel: number | null;
  stressLevel: number | null;
  soreness: number | null;
  recovery: number | null;
  notes?: string;
  statsNotes?: string;
  checkInDate?: string;
  photos: Photo[];
}

export type CheckInFormData = CheckIn;

interface PastCheckIn {
  id: string;
  date: string;
  photoCount: number;
}

// Collapsible section component
const CollapsibleSection = ({
  title,
  icon: Icon,
  children,
  defaultOpen = true
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-[#0F172A]">{title}</h2>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-[#94A3B8]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#94A3B8]" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-6 pt-2">
          {children}
        </div>
      )}
    </div>
  );
};

function CheckInPageContent() {
  const router = useRouter();
  const [formData, setFormData] = useState<CheckIn>({
    date: new Date().toISOString().split('T')[0],
    weight: null,
    bodyFat: null,
    chest: null,
    waist: null,
    hips: null,
    bicepLeft: null,
    bicepLeftFlex: null,
    bicepRight: null,
    bicepRightFlex: null,
    thighLeft: null,
    thighRight: null,
    calfLeft: null,
    calfRight: null,
    sleepHours: null,
    sleepQuality: null,
    energyLevel: null,
    stressLevel: null,
    soreness: null,
    recovery: null,
    photos: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkInDate, setCheckInDate] = useState(() => {
    const today = new Date();
    const lastMonday = new Date(today);
    lastMonday.setDate(lastMonday.getDate() - ((lastMonday.getDay() + 6) % 7));
    return lastMonday.toISOString().split('T')[0];
  });

  // Check-in history state
  const [pastCheckIns, setPastCheckIns] = useState<PastCheckIn[]>([]);
  const [programId, setProgramId] = useState<string | null>(null);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Fetch past check-ins with photos
  useEffect(() => {
    async function fetchCheckInHistory() {
      try {
        // First get the current program
        const programRes = await fetch('/api/programs/latest');
        if (!programRes.ok) {
          setLoadingHistory(false);
          return;
        }
        const programData = await programRes.json();
        if (!programData.id) {
          setLoadingHistory(false);
          return;
        }
        setProgramId(programData.id);

        // Then fetch check-ins with photos
        const checkInsRes = await fetch(`/api/programs/${programData.id}/progress-photos/compare`);
        if (checkInsRes.ok) {
          const data = await checkInsRes.json();
          const checkIns = (data.checkIns || []).map((checkIn: { id: string; date: string; photos: unknown[] }) => ({
            id: checkIn.id,
            date: checkIn.date,
            photoCount: checkIn.photos?.length || 0,
          }));
          setPastCheckIns(checkIns);
        }
      } catch (error) {
        console.error('Error fetching check-in history:', error);
      } finally {
        setLoadingHistory(false);
      }
    }

    fetchCheckInHistory();
  }, []);

  React.useEffect(() => {
    setFormData(prev => ({ ...prev, date: checkInDate }));
  }, [checkInDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await createCheckIn(formData);

      if (!response.success) {
        throw new Error('Failed to submit check-in');
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Error submitting check-in:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "mt-1 block w-full px-3 py-2.5 rounded-lg border border-[#F1F5F9] bg-white text-[#0F172A] placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] hover:border-[#94A3B8] transition-colors duration-200";
  const labelClasses = "block text-sm font-medium text-[#475569] mb-1";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Weekly Check-in</h1>
        <p className="text-[#475569]">Track your progress and update your measurements</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Picker Section */}
        <CollapsibleSection title="Check-in Date" icon={Calendar}>
          <div className="max-w-xs">
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className={inputClasses}
            />
          </div>
        </CollapsibleSection>

        {/* Body Stats Section */}
        <CollapsibleSection title="Body Stats" icon={Scale}>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="weight" className={labelClasses}>Weight (lbs)</label>
              <input
                type="number"
                id="weight"
                step="0.1"
                value={formData.weight || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value ? Number(e.target.value) : null }))}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="bodyFat" className={labelClasses}>Body Fat %</label>
              <input
                type="number"
                id="bodyFat"
                step="0.1"
                value={formData.bodyFat || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, bodyFat: e.target.value ? Number(e.target.value) : null }))}
                className={inputClasses}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Body Measurements Section */}
        <CollapsibleSection title="Body Measurements" icon={Ruler} defaultOpen={false}>
          <div className="space-y-6">
            {/* Core Measurements */}
            <div>
              <h3 className="font-['Space_Mono'] text-xs uppercase tracking-wider text-[#94A3B8] mb-4">Core</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="chest" className={labelClasses}>Chest (in)</label>
                  <input
                    type="number"
                    id="chest"
                    step="0.25"
                    value={formData.chest || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, chest: e.target.value ? Number(e.target.value) : null }))}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label htmlFor="waist" className={labelClasses}>Waist (in)</label>
                  <input
                    type="number"
                    id="waist"
                    step="0.25"
                    value={formData.waist || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, waist: e.target.value ? Number(e.target.value) : null }))}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label htmlFor="hips" className={labelClasses}>Hips (in)</label>
                  <input
                    type="number"
                    id="hips"
                    step="0.25"
                    value={formData.hips || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, hips: e.target.value ? Number(e.target.value) : null }))}
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>

            {/* Arms */}
            <div>
              <h3 className="font-['Space_Mono'] text-xs uppercase tracking-wider text-[#94A3B8] mb-4">Arms</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="bicepLeft" className={labelClasses}>Left Bicep (in)</label>
                    <input
                      type="number"
                      id="bicepLeft"
                      step="0.25"
                      value={formData.bicepLeft || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, bicepLeft: e.target.value ? Number(e.target.value) : null }))}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label htmlFor="bicepLeftFlex" className={labelClasses}>Left Bicep Flexed (in)</label>
                    <input
                      type="number"
                      id="bicepLeftFlex"
                      step="0.25"
                      value={formData.bicepLeftFlex || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, bicepLeftFlex: e.target.value ? Number(e.target.value) : null }))}
                      className={inputClasses}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="bicepRight" className={labelClasses}>Right Bicep (in)</label>
                    <input
                      type="number"
                      id="bicepRight"
                      step="0.25"
                      value={formData.bicepRight || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, bicepRight: e.target.value ? Number(e.target.value) : null }))}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label htmlFor="bicepRightFlex" className={labelClasses}>Right Bicep Flexed (in)</label>
                    <input
                      type="number"
                      id="bicepRightFlex"
                      step="0.25"
                      value={formData.bicepRightFlex || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, bicepRightFlex: e.target.value ? Number(e.target.value) : null }))}
                      className={inputClasses}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Legs */}
            <div>
              <h3 className="font-['Space_Mono'] text-xs uppercase tracking-wider text-[#94A3B8] mb-4">Legs</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="thighLeft" className={labelClasses}>Left Thigh (in)</label>
                    <input
                      type="number"
                      id="thighLeft"
                      step="0.25"
                      value={formData.thighLeft || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, thighLeft: e.target.value ? Number(e.target.value) : null }))}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label htmlFor="calfLeft" className={labelClasses}>Left Calf (in)</label>
                    <input
                      type="number"
                      id="calfLeft"
                      step="0.25"
                      value={formData.calfLeft || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, calfLeft: e.target.value ? Number(e.target.value) : null }))}
                      className={inputClasses}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="thighRight" className={labelClasses}>Right Thigh (in)</label>
                    <input
                      type="number"
                      id="thighRight"
                      step="0.25"
                      value={formData.thighRight || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, thighRight: e.target.value ? Number(e.target.value) : null }))}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label htmlFor="calfRight" className={labelClasses}>Right Calf (in)</label>
                    <input
                      type="number"
                      id="calfRight"
                      step="0.25"
                      value={formData.calfRight || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, calfRight: e.target.value ? Number(e.target.value) : null }))}
                      className={inputClasses}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Wellness Section */}
        <CollapsibleSection title="Wellness" icon={Heart}>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="sleepHours" className={labelClasses}>Sleep (hours)</label>
                <input
                  type="number"
                  id="sleepHours"
                  step="0.5"
                  value={formData.sleepHours || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, sleepHours: e.target.value ? Number(e.target.value) : null }))}
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="sleepQuality" className={labelClasses}>Sleep Quality (1-10)</label>
                <input
                  type="number"
                  id="sleepQuality"
                  min="1"
                  max="10"
                  value={formData.sleepQuality || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, sleepQuality: e.target.value ? Number(e.target.value) : null }))}
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="energyLevel" className={labelClasses}>Energy Level (1-10)</label>
                <input
                  type="number"
                  id="energyLevel"
                  min="1"
                  max="10"
                  value={formData.energyLevel || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, energyLevel: e.target.value ? Number(e.target.value) : null }))}
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="stressLevel" className={labelClasses}>Stress Level (1-10)</label>
                <input
                  type="number"
                  id="stressLevel"
                  min="1"
                  max="10"
                  value={formData.stressLevel || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, stressLevel: e.target.value ? Number(e.target.value) : null }))}
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="soreness" className={labelClasses}>Soreness (1-10)</label>
                <input
                  type="number"
                  id="soreness"
                  min="1"
                  max="10"
                  value={formData.soreness || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, soreness: e.target.value ? Number(e.target.value) : null }))}
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="recovery" className={labelClasses}>Recovery (1-10)</label>
                <input
                  type="number"
                  id="recovery"
                  min="1"
                  max="10"
                  value={formData.recovery || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, recovery: e.target.value ? Number(e.target.value) : null }))}
                  className={inputClasses}
                />
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Photos Section */}
        <CollapsibleSection title="Progress Photos" icon={Camera} defaultOpen={false}>
          {/* Photo Instructions */}
          <div className="mb-6 bg-[#FFE5E5] rounded-xl p-4">
            <h3 className="text-sm font-medium text-[#0F172A] mb-2">Tips for Great Progress Photos</h3>
            <ul className="text-sm text-[#475569] space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-[#FF6B6B]">•</span>
                Take photos in consistent lighting and location
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF6B6B]">•</span>
                Wear fitted clothing that shows your body shape
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF6B6B]">•</span>
                Include front, back, and both side views
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF6B6B]">•</span>
                Stand in a neutral pose with arms slightly away
              </li>
            </ul>
          </div>

          {/* Photo Upload Area */}
          <div className="relative">
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                ${formData.photos.some(p => p.file)
                  ? 'border-green-300 bg-green-50'
                  : 'border-[#F1F5F9] hover:border-[#FF6B6B] hover:bg-[#FFE5E5]/20'}`}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  const photoTypes = ['FRONT', 'BACK', 'SIDE_LEFT', 'SIDE_RIGHT'] as const;

                  const newPhotos = await Promise.all(files.map(async (file, index) => {
                    const base64Data = await new Promise<string>((resolve) => {
                      const reader = new FileReader();
                      reader.onload = () => resolve(reader.result as string);
                      reader.readAsDataURL(file);
                    });

                    return {
                      type: photoTypes[index] || 'CUSTOM',
                      file,
                      base64Data
                    };
                  }));

                  setFormData(prev => ({
                    ...prev,
                    photos: [...prev.photos, ...newPhotos].slice(0, 8)
                  }));
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto bg-[#F8FAFC] rounded-full flex items-center justify-center">
                  <Camera className="w-6 h-6 text-[#94A3B8]" />
                </div>
                <div>
                  <p className="text-base font-medium text-[#0F172A]">
                    Drop your progress photos here
                  </p>
                  <p className="mt-1 text-sm text-[#94A3B8]">
                    or click to select files
                  </p>
                </div>
              </div>
            </div>

            {/* Photo Preview Grid */}
            {formData.photos.some(p => p.file) && (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {formData.photos.filter(p => p.file).map((photo, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={URL.createObjectURL(photo.file!)}
                      alt={`Progress photo ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg">
                      <button
                        type="button"
                        onClick={() => {
                          const newPhotos = [...formData.photos];
                          newPhotos[index] = { ...photo, file: null };
                          setFormData(prev => ({ ...prev, photos: newPhotos.filter(p => p.file) }));
                        }}
                        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100"
                      >
                        <svg className="w-4 h-4 text-[#475569]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-[#0F172A]/70 rounded text-white text-xs">
                      {photo.type.replace('_', ' ').toLowerCase()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* Notes Section */}
        <CollapsibleSection title="Additional Notes" icon={FileText} defaultOpen={false}>
          <textarea
            id="notes"
            rows={4}
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any additional notes about your progress this week..."
            className={inputClasses}
          />
        </CollapsibleSection>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-xl bg-[#FF6B6B] text-white font-semibold hover:bg-[#EF5350] transition-all duration-200 shadow-lg shadow-[#FF6B6B]/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </div>
            ) : (
              'Save Check-in'
            )}
          </button>
        </div>
      </form>

      {/* Check-in History Section */}
      <div className="mt-12 pt-8 border-t border-[#F1F5F9]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#0F172A]">Check-in History</h2>
              <p className="text-sm text-[#94A3B8]">
                {pastCheckIns.length > 0
                  ? `${pastCheckIns.length} check-in${pastCheckIns.length === 1 ? '' : 's'} with photos`
                  : 'No check-ins with photos yet'}
              </p>
            </div>
          </div>

          {pastCheckIns.length >= 2 && programId && (
            <button
              type="button"
              onClick={() => setIsCompareModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 shadow-lg shadow-[#FF6B6B]/25"
              style={{
                background: 'linear-gradient(to right, #FF6B6B, #FF8E8E)',
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Compare Photos
            </button>
          )}
        </div>

        {loadingHistory ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#F1F5F9] border-t-[#FF6B6B] rounded-full animate-spin" />
          </div>
        ) : pastCheckIns.length > 0 ? (
          <div className="grid gap-3">
            {pastCheckIns.map((checkIn) => (
              <div
                key={checkIn.id}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#F1F5F9] hover:border-[#FF6B6B]/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#FFE5E5] rounded-lg flex items-center justify-center">
                    <Camera className="w-5 h-5 text-[#FF6B6B]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#0F172A]">
                      {new Date(checkIn.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-[#94A3B8]">
                      {checkIn.photoCount} photo{checkIn.photoCount === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-[#F8FAFC] rounded-xl border border-dashed border-[#F1F5F9]">
            <Camera className="w-10 h-10 mx-auto text-[#94A3B8] mb-3" />
            <p className="text-[#475569]">No check-ins with photos yet</p>
            <p className="text-sm text-[#94A3B8] mt-1">
              Add photos to your check-ins to compare your progress
            </p>
          </div>
        )}
      </div>

      {/* Photo Comparison Modal */}
      {programId && (
        <PhotoComparison
          programId={programId}
          isOpen={isCompareModalOpen}
          onClose={() => setIsCompareModalOpen(false)}
        />
      )}
    </div>
  );
}

export default function CheckInPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#F1F5F9] border-t-[#FF6B6B] rounded-full animate-spin" />
      </div>
    }>
      <CheckInPageContent />
    </Suspense>
  );
}
