'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Dumbbell, Calendar, Target, TrendingUp, History } from 'lucide-react';
import type { GenerationDataResponse, UserProgramStats } from '@/types/program';

type CreationStep = 'LOADING' | 'INITIAL' | 'AI_QUESTIONS' | 'CUSTOMIZATION' | 'PREVIEW';
type ProgramType = 'SIMILAR' | 'NEW_FOCUS' | 'FRESH_START';

interface AIQuestion {
  id: string;
  question: string;
  context: string;
  response?: string;
}

export default function NewProgramCreation({ userId }: { userId: string }) {
  const [step, setStep] = useState<CreationStep>('LOADING');
  const [programType, setProgramType] = useState<ProgramType | null>(null);
  const [loading, setLoading] = useState(false);
  const [generationData, setGenerationData] = useState<GenerationDataResponse | null>(null);
  const [userStats, setUserStats] = useState<UserProgramStats | null>(null);
  const [aiQuestions, setAiQuestions] = useState<AIQuestion[]>([]);
  const [specificRequests, setSpecificRequests] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [generationResponse, statsResponse] = await Promise.all([
          fetch('/api/programs/generation-data'),
          fetch('/api/user/stats')
        ]);

        if (!generationResponse.ok || !statsResponse.ok) {
          throw new Error('Failed to fetch user data');
        }

        const [generationData, statsData] = await Promise.all([
          generationResponse.json(),
          statsResponse.json()
        ]);

        setGenerationData(generationData);
        setUserStats(statsData);
        setStep('INITIAL');
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your profile data. Please try again.',
          variant: 'destructive',
        });
      }
    };

    fetchUserData();
  }, [toast]);

  const handleProgramTypeSelect = async (type: ProgramType) => {
    try {
      setLoading(true);
      setProgramType(type);

      if (!generationData) {
        throw new Error('No generation data available');
      }

      // Construct initial AI prompt
      const prompt = constructAIPrompt(generationData, type);
      console.log('Initial AI Prompt:', prompt);

      // Get AI questions based on user data
      const questionsResponse = await fetch('/api/ai/program-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          generationData,
          programType: type,
          prompt 
        }),
      });

      if (!questionsResponse.ok) throw new Error('Failed to get AI questions');
      
      const questions: AIQuestion[] = await questionsResponse.json();
      setAiQuestions(questions);
      setStep('AI_QUESTIONS');

    } catch (error) {
      console.error('Error starting program creation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start program creation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionResponse = (id: string, response: string) => {
    setAiQuestions(prev => 
      prev.map(q => q.id === id ? { ...q, response } : q)
    );
  };

  const handleContinue = async () => {
    if (step === 'AI_QUESTIONS') {
      // All questions should be answered
      if (aiQuestions.some(q => !q.response)) {
        toast({
          title: 'Missing Responses',
          description: 'Please answer all questions before continuing.',
          variant: 'destructive',
        });
        return;
      }
      setStep('CUSTOMIZATION');
    }
  };

  const constructAIPrompt = (data: GenerationDataResponse, type: ProgramType) => {
    const {
      currentStats,
      trainingPreferences,
      historicalData,
      context
    } = data;

    // Calculate adherence metrics
    const averageCompletionRate = historicalData?.previousPrograms.reduce(
      (sum, prog) => sum + prog.completionRate,
      0
    ) / Math.max(historicalData?.previousPrograms.length || 0, 1);

    // Format the prompt
    return `
You are an expert personal trainer and exercise physiologist. Analyze this client's profile and ask relevant questions before creating their program.

CLIENT PROFILE:
- Experience Level: ${trainingPreferences.experienceLevel}
- Training Goal: ${trainingPreferences.trainingGoal}
- Available Days: ${trainingPreferences.daysAvailable} days/week
- Training Environment: ${trainingPreferences.environment} with ${trainingPreferences.equipmentAccess.type} equipment
- Current Stats: ${currentStats.weight ? currentStats.weight + 'lbs' : 'Not provided'}
${currentStats.bodyFatLow ? `- Body Fat: ${currentStats.bodyFatLow}% - ${currentStats.bodyFatHigh}%` : ''}

HISTORICAL CONTEXT:
${historicalData?.previousPrograms.length ? `
- Previous Programs: ${historicalData.previousPrograms.length}
- Average Completion Rate: ${(averageCompletionRate * 100).toFixed(1)}%
- Most Recent Program: ${new Date(historicalData.previousPrograms[0].startDate).toLocaleDateString()}
` : 'No previous program history'}

${context?.lastCheckInDate ? `
RECENT ACTIVITY:
- Last Check-in: ${new Date(context.lastCheckInDate).toLocaleDateString()}
- Notes: ${context.specificRequests || 'None provided'}
` : ''}

Program Type Requested: ${type === 'SIMILAR' ? 'Similar to previous program' : 
  type === 'NEW_FOCUS' ? 'New training focus' : 'Fresh start'}

Based on this profile, ask 2-3 specific questions that will help you create a more personalized program. Consider:
1. Their adherence patterns and potential barriers
2. Progress and satisfaction with previous programs
3. Specific goals or areas they want to focus on
4. Any modifications needed based on their schedule or preferences

Format your response as a JSON array of questions, each with:
- id: unique string
- question: the actual question
- context: why you're asking this question
`;
  };

  if (step === 'LOADING') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {step === 'INITIAL' && (
        <>
          {/* User Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-indigo-500" />
                Your Training Profile
              </CardTitle>
              <CardDescription>
                Here&apos;s what we know about your fitness journey
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              {/* Training Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <Dumbbell className="h-5 w-5 text-indigo-500 mt-1" />
                  <div>
                    <h4 className="font-medium">Training Style</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {generationData?.trainingPreferences.experienceLevel} level, focusing on{' '}
                      {generationData?.trainingPreferences.trainingGoal.toLowerCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-indigo-500 mt-1" />
                  <div>
                    <h4 className="font-medium">Availability</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {generationData?.trainingPreferences.daysAvailable} days per week
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-indigo-500 mt-1" />
                  <div>
                    <h4 className="font-medium">Current Stats</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {generationData?.currentStats.weight ? `${generationData.currentStats.weight}lbs` : 'Not provided'}
                      {generationData?.currentStats.bodyFatLow ? `, ${generationData.currentStats.bodyFatLow}% - ${generationData.currentStats.bodyFatHigh}% body fat` : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Training History */}
              {userStats && (
                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <History className="h-5 w-5 text-indigo-500" />
                    <h4 className="font-medium">Training History</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {userStats.totalWorkouts}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Workouts</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {userStats.consistencyMetrics.averageWorkoutsPerWeek.toFixed(1)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Workouts per Week</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {(userStats.consistencyMetrics.averageCompletionRate * 100).toFixed(0)}%
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
                    </div>
                  </div>

                  {userStats.favoriteExercises.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Top Exercises:</p>
                      <div className="flex flex-wrap gap-2">
                        {userStats.favoriteExercises.map((exercise) => (
                          <span
                            key={exercise}
                            className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm rounded-md"
                          >
                            {exercise}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Program Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => !loading && handleProgramTypeSelect('SIMILAR')}
            >
              <CardHeader>
                <CardTitle>Similar Program</CardTitle>
                <CardDescription>
                  Keep the same structure, adjust for progress
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => !loading && handleProgramTypeSelect('NEW_FOCUS')}
            >
              <CardHeader>
                <CardTitle>Change Focus</CardTitle>
                <CardDescription>
                  Modify goal while maintaining history
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => !loading && handleProgramTypeSelect('FRESH_START')}
            >
              <CardHeader>
                <CardTitle>Fresh Start</CardTitle>
                <CardDescription>
                  Complete re-assessment and new program
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </>
      )}

      {step === 'AI_QUESTIONS' && (
        <div className="space-y-6">
          <p className="text-muted-foreground">
            Please answer these questions to help create your personalized program:
          </p>
          
          {aiQuestions.map((q) => (
            <Card key={q.id}>
              <CardHeader>
                <CardTitle className="text-lg">{q.question}</CardTitle>
                <CardDescription>{q.context}</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Your response..."
                  value={q.response || ''}
                  onChange={(e) => handleQuestionResponse(q.id, e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>
          ))}

          <Button 
            onClick={handleContinue}
            disabled={loading || aiQuestions.some(q => !q.response)}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </Button>
        </div>
      )}

      {step === 'CUSTOMIZATION' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Additional Requests</CardTitle>
              <CardDescription>
                Any specific exercises, equipment, or other preferences you&apos;d like to include?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="E.g., I'd like to focus more on compound movements, or I prefer dumbbells over barbells..."
                value={specificRequests}
                onChange={(e) => setSpecificRequests(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          <Button onClick={() => setStep('PREVIEW')} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Program Preview
          </Button>
        </div>
      )}
    </div>
  );
} 