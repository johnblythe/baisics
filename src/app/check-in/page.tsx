'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TawkChat from '@/components/TawkChat';
import { createCheckIn } from './actions';

interface Photo {
  type: 'FRONT' | 'BACK' | 'SIDE_LEFT' | 'SIDE_RIGHT' | 'CUSTOM';
  file: File | null;
  base64Data?: string;
}

export interface CheckIn {
  id?: string;
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

export default function CheckInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CheckIn>({
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
    lastMonday.setDate(lastMonday.getDate() - ((lastMonday.getDay() + 6) % 7)); // Previous Monday
    return lastMonday.toISOString().split('T')[0];
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, checkInDate }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit check-in');
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Error submitting check-in:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200";

  return (
    <div className="flex-grow mt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Weekly Check-in</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your progress and update your measurements</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 mt-8">
          {/* Date Picker Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Check-in Date</h2>
              <div className="max-w-xs">
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          {/* Body Stats Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Body Stats</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Weight (lbs)
                    </label>
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
                    <label htmlFor="bodyFat" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Body Fat %
                    </label>
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
              </div>
            </div>
          </div>

          {/* Body Measurements Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Body Measurements</h2>
              <div className="space-y-6">
                {/* Core Measurements */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Core</h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label htmlFor="chest" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Chest (in)
                      </label>
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
                      <label htmlFor="waist" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Waist (in)
                      </label>
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
                      <label htmlFor="hips" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Hips (in)
                      </label>
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
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Arms</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="bicepLeft" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Left Bicep (in)
                        </label>
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
                        <label htmlFor="bicepLeftFlex" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Left Bicep Flexed (in)
                        </label>
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
                        <label htmlFor="bicepRight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Right Bicep (in)
                        </label>
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
                        <label htmlFor="bicepRightFlex" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Right Bicep Flexed (in)
                        </label>
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
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Legs</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="thighLeft" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Left Thigh (in)
                        </label>
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
                        <label htmlFor="calfLeft" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Left Calf (in)
                        </label>
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
                        <label htmlFor="thighRight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Right Thigh (in)
                        </label>
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
                        <label htmlFor="calfRight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Right Calf (in)
                        </label>
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
            </div>
          </div>

          {/* Wellness Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Wellness</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="sleepHours" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sleep (hours)
                    </label>
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
                    <label htmlFor="sleepQuality" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sleep Quality (1-10)
                    </label>
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
                    <label htmlFor="energyLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Energy Level (1-10)
                    </label>
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
                    <label htmlFor="stressLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Stress Level (1-10)
                    </label>
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
                    <label htmlFor="soreness" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Soreness (1-10)
                    </label>
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
                    <label htmlFor="recovery" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Recovery (1-10)
                    </label>
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
            </div>
          </div>

          {/* Photos Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Progress Photos</h2>
              
              {/* Photo Instructions */}
              <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Tips for Great Progress Photos</h3>
                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Take photos in consistent lighting and location</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Wear fitted clothing that shows your body shape</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Include front, back, and both side views for complete progress tracking</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Stand in a neutral pose with arms slightly away from body</span>
                  </li>
                </ul>
              </div>

              {/* Photo Upload Area */}
              <div className="relative">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
                    ${formData.photos.some(p => p.file) 
                      ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20' 
                      : 'border-gray-300 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
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
                        photos: [...prev.photos, ...newPhotos].slice(0, 8) // Limit to 8 photos
                      }));
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        Drop your progress photos here
                      </p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
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
                            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-50 rounded text-white text-xs">
                          {photo.type.replace('_', ' ').toLowerCase()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Additional Notes</h2>
              <div>
                <label htmlFor="notes" className="sr-only">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes about your progress this week..."
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                'Save Check-in'
              )}
            </button>
          </div>
        </form>
      </div>
      <TawkChat />
      <Footer />
    </div>
  );
} 