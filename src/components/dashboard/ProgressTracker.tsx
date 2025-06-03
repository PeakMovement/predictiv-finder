
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Target, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface HealthGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  category: string;
}

interface ActivityLog {
  id: string;
  type: string;
  description: string;
  date: Date;
  status: 'completed' | 'missed' | 'scheduled';
}

export const ProgressTracker: React.FC = () => {
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState(75);

  useEffect(() => {
    if (currentUser) {
      loadUserProgress();
    }
  }, [currentUser]);

  const loadUserProgress = () => {
    // Mock data - in real implementation, this would fetch from database
    setGoals([
      {
        id: '1',
        title: 'Weight Loss',
        description: 'Lose 10kg through diet and exercise',
        target: 10,
        current: 6.5,
        unit: 'kg',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        category: 'Fitness'
      },
      {
        id: '2',
        title: 'Daily Steps',
        description: 'Walk 10,000 steps daily',
        target: 10000,
        current: 7500,
        unit: 'steps',
        deadline: new Date(),
        category: 'Activity'
      }
    ]);

    setActivities([
      {
        id: '1',
        type: 'Exercise Session',
        description: 'Strength training with physiotherapist',
        date: new Date(),
        status: 'completed'
      },
      {
        id: '2',
        type: 'Nutrition Consultation',
        description: 'Diet plan review with nutritionist',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'scheduled'
      }
    ]);
  };

  const getProgressPercentage = (goal: HealthGoal) => {
    return Math.min((goal.current / goal.target) * 100, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'missed': return 'bg-red-500';
      case 'scheduled': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p>Please sign in to track your progress</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Progress Tracker</h2>
        <Badge variant="secondary" className="flex items-center gap-1">
          <TrendingUp className="h-4 w-4" />
          {weeklyProgress}% Weekly Goal
        </Badge>
      </div>

      {/* Goals Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => (
          <Card key={goal.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{goal.title}</CardTitle>
                <Badge variant="outline">{goal.category}</Badge>
              </div>
              <CardDescription>{goal.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>{goal.current} {goal.unit}</span>
                  <span>{goal.target} {goal.unit}</span>
                </div>
                <Progress value={getProgressPercentage(goal)} className="h-2" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Target: {format(goal.deadline, 'MMM dd, yyyy')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(activity.status)}`} />
                  <div>
                    <p className="font-medium">{activity.type}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm">{format(activity.date, 'MMM dd')}</p>
                  <Badge 
                    variant={activity.status === 'completed' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
