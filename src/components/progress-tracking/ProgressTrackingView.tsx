
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AIHealthPlan } from '@/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays, startOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { CheckCircle, Circle, Clock } from 'lucide-react';

interface ProgressTrackingViewProps {
  plan: AIHealthPlan;
  onBack: () => void;
}

// Generate mock tracking data based on the plan
const generateMockProgressData = (plan: AIHealthPlan) => {
  const timeframeWeeks = parseInt(plan.timeFrame.split(' ')[0]) || 8;
  const totalDays = timeframeWeeks * 7;
  const today = new Date();
  const startDate = new Date(today.getTime() - (totalDays / 3) * 24 * 60 * 60 * 1000);
  
  // Generate progress data points
  return Array.from({ length: Math.floor(totalDays / 3) }).map((_, index) => {
    const day = index * 3;
    const date = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
    const progressPercent = Math.min(100, (day / totalDays) * 100);
    
    // Add some randomness to make the data look more realistic
    const randomFactor = (Math.random() * 10) - 5;
    const adjustedProgress = Math.max(0, Math.min(100, progressPercent + randomFactor));
    
    return {
      date: format(date, 'MMM dd'),
      progress: Math.round(adjustedProgress),
      fullDate: date,
    };
  });
};

// Generate mock sessions data
const generateMockSessionsData = (plan: AIHealthPlan) => {
  const today = new Date();
  const startDate = new Date(today.getTime() - 21 * 24 * 60 * 60 * 1000);
  const endDate = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
  
  // Create array of sessions
  const sessions = plan.services.flatMap(service => {
    return Array.from({ length: service.sessions }).map((_, sessionIndex) => {
      // Distribute sessions over the timeframe
      const daysOffset = Math.floor((sessionIndex / service.sessions) * 80) - 20;
      const sessionDate = new Date(today.getTime() + daysOffset * 24 * 60 * 60 * 1000);
      
      return {
        id: `${service.type}-session-${sessionIndex + 1}`,
        serviceType: service.type,
        date: sessionDate,
        completed: sessionDate < today,
        title: `${service.type.replace('-', ' ')} Session ${sessionIndex + 1}`,
        notes: sessionDate < today ? 
          "Session completed successfully. Progress noted towards goals." : 
          "Upcoming session"
      };
    });
  });
  
  // Sort by date
  return sessions.sort((a, b) => a.date.getTime() - b.date.getTime());
};

const ProgressTrackingView: React.FC<ProgressTrackingViewProps> = ({
  plan,
  onBack,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const progressData = generateMockProgressData(plan);
  const sessionsData = generateMockSessionsData(plan);
  
  // Calculate overall progress
  const currentProgress = progressData.find(d => 
    format(new Date(), 'MMM dd') === d.date
  )?.progress || Math.floor(progressData.length / 3 * 100);
  
  // Get the selected day's sessions
  const selectedDateSessions = sessionsData.filter(session => 
    selectedDate && isSameDay(session.date, selectedDate)
  );
  
  // Calculate completion statistics
  const completedSessions = sessionsData.filter(s => s.completed).length;
  const totalSessions = sessionsData.length;
  const completionRate = Math.round((completedSessions / totalSessions) * 100);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack} 
          className="mr-2"
          aria-label="Go back"
        >
          ←
        </Button>
        <h2 className="text-2xl font-semibold">Your Progress Tracking</h2>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{plan.name}</CardTitle>
          <div className="flex items-center mt-1">
            <Badge variant={currentProgress > 50 ? "default" : "outline"}>
              {currentProgress}% Complete
            </Badge>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              {plan.timeFrame} plan
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={currentProgress} className="h-2" />
            
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Start</span>
              <span>Current</span>
              <span>Target</span>
            </div>
            
            {/* Summary statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-base">Sessions Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedSessions}/{totalSessions}</div>
                  <Progress value={completionRate} className="h-1 mt-2" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-base">Next Session</CardTitle>
                </CardHeader>
                <CardContent>
                  {sessionsData.find(s => !s.completed) ? (
                    <div>
                      <div className="text-lg font-bold">
                        {format(sessionsData.find(s => !s.completed)!.date, 'MMMM dd')}
                      </div>
                      <div className="text-sm capitalize text-gray-600 dark:text-gray-300">
                        {sessionsData.find(s => !s.completed)!.serviceType.replace('-', ' ')}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500">No upcoming sessions</div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-base">Estimated Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">
                    {format(addDays(new Date(), parseInt(plan.timeFrame) * 5), 'MMMM dd, yyyy')}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    On track with your goals
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="progress" className="mb-6">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="progress">Progress Chart</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="progress" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Progress Over Time</CardTitle>
              <CardDescription>
                Your health journey visualized over the course of your plan
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    padding={{ left: 30, right: 30 }} 
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    label={{ 
                      value: 'Progress %', 
                      angle: -90, 
                      position: 'insideLeft' 
                    }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="progress"
                    stroke="#8B5CF6"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sessions" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Calendar</CardTitle>
                <CardDescription>Select a date to see your sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  // Highlight days with sessions
                  modifiers={{
                    completed: sessionsData.filter(s => s.completed).map(s => s.date),
                    upcoming: sessionsData.filter(s => !s.completed).map(s => s.date),
                  }}
                  modifiersStyles={{
                    completed: {
                      backgroundColor: '#10b9815b',
                    },
                    upcoming: {
                      backgroundColor: '#8B5CF61a',
                      fontWeight: 'bold',
                    },
                  }}
                />
                
                <div className="flex items-center justify-center mt-4 space-x-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-200 rounded-full mr-1.5"></div>
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-200 rounded-full mr-1.5"></div>
                    <span>Upcoming</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate ? format(selectedDate, 'MMMM dd, yyyy') : 'No Date Selected'}
                </CardTitle>
                <CardDescription>
                  {selectedDateSessions.length 
                    ? `${selectedDateSessions.length} session${selectedDateSessions.length > 1 ? 's' : ''} scheduled`
                    : 'No sessions scheduled for this date'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDateSessions.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDateSessions.map((session) => (
                      <div key={session.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center mb-1">
                          {session.completed ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <Clock className="h-4 w-4 text-purple-500 mr-2" />
                          )}
                          <h4 className="font-medium capitalize">{session.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{session.notes}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <Circle className="h-12 w-12 mx-auto opacity-20 mb-2" />
                    <p>No sessions scheduled for this date.</p>
                    <p className="text-sm mt-2">Select a date with a highlighted background to view sessions.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="outcomes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Expected Outcomes</CardTitle>
              <CardDescription>
                Track your progress toward these key milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              {plan.expectedOutcomes ? (
                <div className="space-y-6">
                  {plan.expectedOutcomes.map((outcome, index) => {
                    // Calculate mock progress based on current date
                    const timeframeWeeks = parseInt(outcome.timeframe) || 4;
                    const totalDays = timeframeWeeks * 7;
                    const elapsedDays = Math.min(totalDays, 21); // Mock elapsed time
                    const progress = Math.round((elapsedDays / totalDays) * 100);
                    
                    return (
                      <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className="font-medium text-lg">{outcome.milestone}</h4>
                          <Badge variant="outline" className="text-xs">
                            Target: {outcome.timeframe}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          {outcome.description}
                        </p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-1.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <p>No detailed outcome tracking available for this plan.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-center mt-8">
        <Button variant="outline" onClick={onBack}>
          Back to Plan Details
        </Button>
      </div>
    </motion.div>
  );
};

export default ProgressTrackingView;
