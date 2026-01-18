'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/app/components/layouts/MainLayout';
import { Settings, User, Crown, Dumbbell, Shield, Bell, Mail, Camera, Sparkles } from 'lucide-react';

const isDev = process.env.NODE_ENV === 'development';

interface UserData {
  id: string;
  email: string;
  name: string | null;
  isCoach: boolean;
  isPremium: boolean;
  subscriptionStatus: string | null;
}

interface NotificationPrefs {
  emailReminders: boolean;
  weeklySummaryEnabled: boolean;
  weeklySummaryDay: 'sunday' | 'monday';
}

// Tripod Mode - the gym influencer troll feature
const TRIPOD_MODE_KEY = 'baisics_tripod_mode';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [tripodMode, setTripodMode] = useState(false);
  const [showTripodMessage, setShowTripodMessage] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchUserData();
      fetchNotificationPrefs();
    }
  }, [status, router]);

  // Load Tripod Mode from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(TRIPOD_MODE_KEY);
    if (stored === 'true') {
      setTripodMode(true);
    }
  }, []);

  const toggleTripodMode = () => {
    const newValue = !tripodMode;
    setTripodMode(newValue);
    localStorage.setItem(TRIPOD_MODE_KEY, String(newValue));

    // Show the troll message when turning ON
    if (newValue) {
      setShowTripodMessage(true);
      // Auto-hide after 4 seconds
      setTimeout(() => setShowTripodMessage(false), 4000);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotificationPrefs = async () => {
    try {
      const response = await fetch('/api/user/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotificationPrefs(data);
      }
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
    }
  };

  const updateNotificationPref = async (key: keyof NotificationPrefs, value: boolean | string) => {
    if (!notificationPrefs) return;

    setIsSavingNotifications(true);
    try {
      const response = await fetch('/api/user/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });

      if (response.ok) {
        const data = await response.json();
        setNotificationPrefs({
          emailReminders: data.emailReminders,
          weeklySummaryEnabled: data.weeklySummaryEnabled,
          weeklySummaryDay: data.weeklySummaryDay,
        });
      }
    } catch (error) {
      console.error('Failed to update notification preference:', error);
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const toggleUserRole = async (field: 'isCoach' | 'isPremium') => {
    if (!userData || !isDev) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/user/dev-toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field,
          value: !userData[field]
        }),
      });

      if (response.ok) {
        setUserData(prev => prev ? { ...prev, [field]: !prev[field] } : null);
      }
    } catch (error) {
      console.error('Failed to toggle:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-6 h-6 border-2 border-[#F1F5F9] border-t-[#FF6B6B] rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-[#F8FAFC] min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex items-center gap-3 mb-8">
            <Settings className="w-8 h-8 text-[#FF6B6B]" />
            <h1 className="text-2xl font-bold text-[#0F172A]">Settings</h1>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#64748B]" />
              Account
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Email</span>
                <span className="text-[#0F172A]">{userData?.email || session?.user?.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Name</span>
                <span className="text-[#0F172A]">{userData?.name || 'Not set'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#64748B]">Subscription</span>
                <span className="text-[#0F172A] capitalize">
                  {userData?.subscriptionStatus || 'Free'}
                </span>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#64748B]" />
              Notifications
            </h2>

            <div className="space-y-4">
              {/* Daily Workout Reminders */}
              <div className="flex items-center justify-between py-3 px-4 bg-[#F8FAFC] rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#64748B]" />
                  <div>
                    <p className="font-medium text-[#0F172A]">Daily Workout Reminders</p>
                    <p className="text-xs text-[#64748B]">Get reminded when you have a workout scheduled</p>
                  </div>
                </div>
                <button
                  onClick={() => updateNotificationPref('emailReminders', !notificationPrefs?.emailReminders)}
                  disabled={isSavingNotifications || !notificationPrefs}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notificationPrefs?.emailReminders ? 'bg-[#FF6B6B]' : 'bg-[#E2E8F0]'
                  } ${isSavingNotifications ? 'opacity-50' : ''}`}
                >
                  <span
                    className={`absolute left-0 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      notificationPrefs?.emailReminders ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Weekly Summary */}
              <div className="flex items-center justify-between py-3 px-4 bg-[#F8FAFC] rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#64748B]" />
                  <div>
                    <p className="font-medium text-[#0F172A]">Weekly Summary</p>
                    <p className="text-xs text-[#64748B]">Receive a weekly recap of your progress</p>
                  </div>
                </div>
                <button
                  onClick={() => updateNotificationPref('weeklySummaryEnabled', !notificationPrefs?.weeklySummaryEnabled)}
                  disabled={isSavingNotifications || !notificationPrefs}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notificationPrefs?.weeklySummaryEnabled ? 'bg-[#FF6B6B]' : 'bg-[#E2E8F0]'
                  } ${isSavingNotifications ? 'opacity-50' : ''}`}
                >
                  <span
                    className={`absolute left-0 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      notificationPrefs?.weeklySummaryEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Weekly Summary Day Selection */}
              {notificationPrefs?.weeklySummaryEnabled && (
                <div className="flex items-center justify-between py-3 px-4 bg-[#F8FAFC] rounded-lg ml-8">
                  <div>
                    <p className="font-medium text-[#0F172A]">Summary Day</p>
                    <p className="text-xs text-[#64748B]">Choose when to receive your weekly summary</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateNotificationPref('weeklySummaryDay', 'sunday')}
                      disabled={isSavingNotifications}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        notificationPrefs?.weeklySummaryDay === 'sunday'
                          ? 'bg-[#FF6B6B] text-white'
                          : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#FF6B6B]'
                      } ${isSavingNotifications ? 'opacity-50' : ''}`}
                    >
                      Sunday
                    </button>
                    <button
                      onClick={() => updateNotificationPref('weeklySummaryDay', 'monday')}
                      disabled={isSavingNotifications}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        notificationPrefs?.weeklySummaryDay === 'monday'
                          ? 'bg-[#FF6B6B] text-white'
                          : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#FF6B6B]'
                      } ${isSavingNotifications ? 'opacity-50' : ''}`}
                    >
                      Monday
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tripod Mode - Fun Stuff */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 mb-6 relative overflow-hidden">
            <h2 className="text-lg font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF6B6B]" />
              Fun Stuff
            </h2>

            <div className="space-y-4">
              {/* Tripod Mode Toggle */}
              <div className="flex items-center justify-between py-3 px-4 bg-[#F8FAFC] rounded-lg">
                <div className="flex items-center gap-3">
                  <Camera className="w-5 h-5 text-[#64748B]" />
                  <div>
                    <p className="font-medium text-[#0F172A]">Tripod Mode</p>
                    <p className="text-xs text-[#64748B]">Enable snarky gym influencer commentary</p>
                  </div>
                </div>
                <button
                  onClick={toggleTripodMode}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    tripodMode ? 'bg-[#FF6B6B]' : 'bg-[#E2E8F0]'
                  }`}
                >
                  <span
                    className={`absolute left-0 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      tripodMode ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Tripod Mode Activation Message */}
            {showTripodMessage && (
              <div className="absolute inset-0 bg-[#0F172A]/95 flex items-center justify-center p-6 animate-in fade-in duration-300">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-[#FF6B6B] mx-auto mb-4" />
                  <p className="text-white font-bold text-lg mb-2">
                    lol fuck you poser.
                  </p>
                  <p className="text-white/80">
                    Put your camera up, get your work ethic out.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Current Roles */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#0F172A] mb-4">Current Status</h2>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-[#F1F5F9] text-[#64748B]">
                <User className="w-4 h-4" />
                Free User
              </span>
              {userData?.isPremium && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
                  <Crown className="w-4 h-4" />
                  Premium
                </span>
              )}
              {userData?.isCoach && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-[#FFE5E5] text-[#FF6B6B]">
                  <Dumbbell className="w-4 h-4" />
                  Coach
                </span>
              )}
            </div>
          </div>

          {/* Dev Mode Toggles */}
          {isDev && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-amber-800 mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Dev Mode Controls
              </h2>
              <p className="text-sm text-amber-700 mb-4">
                Toggle user roles for testing. Only visible in development.
              </p>

              <div className="space-y-4">
                {/* Premium Toggle */}
                <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-amber-200">
                  <div className="flex items-center gap-3">
                    <Crown className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="font-medium text-[#0F172A]">Premium Status</p>
                      <p className="text-xs text-[#64748B]">Unlock unlimited programs, history access</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleUserRole('isPremium')}
                    disabled={isSaving}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      userData?.isPremium ? 'bg-amber-500' : 'bg-[#E2E8F0]'
                    } ${isSaving ? 'opacity-50' : ''}`}
                  >
                    <span
                      className={`absolute left-0 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        userData?.isPremium ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Coach Toggle */}
                <div className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-amber-200">
                  <div className="flex items-center gap-3">
                    <Dumbbell className="w-5 h-5 text-[#FF6B6B]" />
                    <div>
                      <p className="font-medium text-[#0F172A]">Coach Status</p>
                      <p className="text-xs text-[#64748B]">Access coach dashboard, manage clients</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleUserRole('isCoach')}
                    disabled={isSaving}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      userData?.isCoach ? 'bg-[#FF6B6B]' : 'bg-[#E2E8F0]'
                    } ${isSaving ? 'opacity-50' : ''}`}
                  >
                    <span
                      className={`absolute left-0 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        userData?.isCoach ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
