'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { createCheckIn } from './actions';

export type CheckInFormData = {
  // Basic Info
  type: 'initial' | 'progress' | 'end';
  notes: string;

  // Body Stats
  weight: number | null;
  bodyFat: number | null;
  statsNotes: string;

  // Body Measurements
  chest: number | null;
  waist: number | null;
  hips: number | null;
  bicepLeft: number | null;
  bicepRight: number | null;
  bicepLeftFlex: number | null;
  bicepRightFlex: number | null;
  thighLeft: number | null;
  thighRight: number | null;
  calfLeft: number | null;
  calfRight: number | null;

  // Wellness
  sleepHours: number | null;
  sleepQuality: number | null;
  energyLevel: number | null;
  stressLevel: number | null;
  soreness: number | null;
  recovery: number | null;

  // Photos
  photos: {
    type: 'FRONT' | 'BACK' | 'SIDE_LEFT' | 'SIDE_RIGHT' | 'CUSTOM';
    file: File | null;
  }[];
};

const initialFormData: CheckInFormData = {
  type: 'progress',
  notes: 'Feeling stronger this week, especially in my upper body workouts.',
  weight: 185.5,
  bodyFat: 18.2,
  statsNotes: 'Measured first thing in the morning',
  
  // Body Measurements
  chest: 42.5,
  waist: 34.25,
  hips: 41.0,
  bicepLeft: 14.75,
  bicepRight: 15.0,
  bicepLeftFlex: 15.5,
  bicepRightFlex: 15.75,
  thighLeft: 23.5,
  thighRight: 23.75,
  calfLeft: 15.25,
  calfRight: 15.5,

  // Wellness
  sleepHours: 7.5,
  sleepQuality: 8,
  energyLevel: 7,
  stressLevel: 4,
  soreness: 6,
  recovery: 7,

  photos: [
    { type: 'FRONT', file: null },
    { type: 'BACK', file: null },
    { type: 'SIDE_LEFT', file: null },
    { type: 'SIDE_RIGHT', file: null },
  ],
};

export default function CheckInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CheckInFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await createCheckIn(formData);
      
      if (result.success) {
        router.push('/dashboard');
      } else {
        // TODO: Show error toast
        console.error('Failed to create check-in:', result.error);
      }
    } catch (error) {
      console.error('Error submitting check-in:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-white pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Weekly Check-in</h1>
              <p className="mt-2 text-sm text-gray-600">
                Track your progress and update your measurements
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Body Stats Section */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Body Stats</h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                          Weight (lbs)
                        </label>
                        <input
                          type="number"
                          id="weight"
                          step="0.1"
                          value={formData.weight || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value ? Number(e.target.value) : null }))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="bodyFat" className="block text-sm font-medium text-gray-700">
                          Body Fat %
                        </label>
                        <input
                          type="number"
                          id="bodyFat"
                          step="0.1"
                          value={formData.bodyFat || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, bodyFat: e.target.value ? Number(e.target.value) : null }))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body Measurements Section */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Body Measurements</h2>
                  <div className="space-y-6">
                    {/* Core Measurements */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-4">Core</h3>
                      <div className="grid grid-cols-3 gap-6">
                        <div>
                          <label htmlFor="chest" className="block text-sm font-medium text-gray-700">
                            Chest (in)
                          </label>
                          <input
                            type="number"
                            id="chest"
                            step="0.25"
                            value={formData.chest || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, chest: e.target.value ? Number(e.target.value) : null }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="waist" className="block text-sm font-medium text-gray-700">
                            Waist (in)
                          </label>
                          <input
                            type="number"
                            id="waist"
                            step="0.25"
                            value={formData.waist || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, waist: e.target.value ? Number(e.target.value) : null }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="hips" className="block text-sm font-medium text-gray-700">
                            Hips (in)
                          </label>
                          <input
                            type="number"
                            id="hips"
                            step="0.25"
                            value={formData.hips || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, hips: e.target.value ? Number(e.target.value) : null }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Arms */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-4">Arms</h3>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="bicepLeft" className="block text-sm font-medium text-gray-700">
                              Left Bicep (in)
                            </label>
                            <input
                              type="number"
                              id="bicepLeft"
                              step="0.25"
                              value={formData.bicepLeft || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, bicepLeft: e.target.value ? Number(e.target.value) : null }))}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="bicepLeftFlex" className="block text-sm font-medium text-gray-700">
                              Left Bicep Flexed (in)
                            </label>
                            <input
                              type="number"
                              id="bicepLeftFlex"
                              step="0.25"
                              value={formData.bicepLeftFlex || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, bicepLeftFlex: e.target.value ? Number(e.target.value) : null }))}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="bicepRight" className="block text-sm font-medium text-gray-700">
                              Right Bicep (in)
                            </label>
                            <input
                              type="number"
                              id="bicepRight"
                              step="0.25"
                              value={formData.bicepRight || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, bicepRight: e.target.value ? Number(e.target.value) : null }))}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="bicepRightFlex" className="block text-sm font-medium text-gray-700">
                              Right Bicep Flexed (in)
                            </label>
                            <input
                              type="number"
                              id="bicepRightFlex"
                              step="0.25"
                              value={formData.bicepRightFlex || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, bicepRightFlex: e.target.value ? Number(e.target.value) : null }))}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Legs */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-4">Legs</h3>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="thighLeft" className="block text-sm font-medium text-gray-700">
                              Left Thigh (in)
                            </label>
                            <input
                              type="number"
                              id="thighLeft"
                              step="0.25"
                              value={formData.thighLeft || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, thighLeft: e.target.value ? Number(e.target.value) : null }))}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="calfLeft" className="block text-sm font-medium text-gray-700">
                              Left Calf (in)
                            </label>
                            <input
                              type="number"
                              id="calfLeft"
                              step="0.25"
                              value={formData.calfLeft || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, calfLeft: e.target.value ? Number(e.target.value) : null }))}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="thighRight" className="block text-sm font-medium text-gray-700">
                              Right Thigh (in)
                            </label>
                            <input
                              type="number"
                              id="thighRight"
                              step="0.25"
                              value={formData.thighRight || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, thighRight: e.target.value ? Number(e.target.value) : null }))}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="calfRight" className="block text-sm font-medium text-gray-700">
                              Right Calf (in)
                            </label>
                            <input
                              type="number"
                              id="calfRight"
                              step="0.25"
                              value={formData.calfRight || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, calfRight: e.target.value ? Number(e.target.value) : null }))}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wellness Section */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Wellness</h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="sleepHours" className="block text-sm font-medium text-gray-700">
                          Sleep (hours)
                        </label>
                        <input
                          type="number"
                          id="sleepHours"
                          step="0.5"
                          value={formData.sleepHours || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, sleepHours: e.target.value ? Number(e.target.value) : null }))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="sleepQuality" className="block text-sm font-medium text-gray-700">
                          Sleep Quality (1-10)
                        </label>
                        <input
                          type="number"
                          id="sleepQuality"
                          min="1"
                          max="10"
                          value={formData.sleepQuality || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, sleepQuality: e.target.value ? Number(e.target.value) : null }))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="energyLevel" className="block text-sm font-medium text-gray-700">
                          Energy Level (1-10)
                        </label>
                        <input
                          type="number"
                          id="energyLevel"
                          min="1"
                          max="10"
                          value={formData.energyLevel || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, energyLevel: e.target.value ? Number(e.target.value) : null }))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="stressLevel" className="block text-sm font-medium text-gray-700">
                          Stress Level (1-10)
                        </label>
                        <input
                          type="number"
                          id="stressLevel"
                          min="1"
                          max="10"
                          value={formData.stressLevel || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, stressLevel: e.target.value ? Number(e.target.value) : null }))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="soreness" className="block text-sm font-medium text-gray-700">
                          Soreness (1-10)
                        </label>
                        <input
                          type="number"
                          id="soreness"
                          min="1"
                          max="10"
                          value={formData.soreness || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, soreness: e.target.value ? Number(e.target.value) : null }))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="recovery" className="block text-sm font-medium text-gray-700">
                          Recovery (1-10)
                        </label>
                        <input
                          type="number"
                          id="recovery"
                          min="1"
                          max="10"
                          value={formData.recovery || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, recovery: e.target.value ? Number(e.target.value) : null }))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photos Section */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Progress Photos</h2>
                  <div className="grid grid-cols-2 gap-6">
                    {formData.photos.map((photo, index) => (
                      <div key={photo.type} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {photo.type.replace('_', ' ').toLowerCase()} view
                        </label>
                        <div className="relative">
                          {photo.file ? (
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={URL.createObjectURL(photo.file)}
                                alt={`${photo.type} view`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newPhotos = [...formData.photos];
                                  newPhotos[index] = { ...photo, file: null };
                                  setFormData(prev => ({ ...prev, photos: newPhotos }));
                                }}
                                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100"
                              >
                                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <label className="block">
                              <span className="sr-only">Choose photo</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const newPhotos = [...formData.photos];
                                    newPhotos[index] = { ...photo, file };
                                    setFormData(prev => ({ ...prev, photos: newPhotos }));
                                  }
                                }}
                                className="block w-full text-sm text-gray-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-indigo-50 file:text-indigo-700
                                  hover:file:bg-indigo-100
                                "
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Additional Notes</h2>
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
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Check-in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 