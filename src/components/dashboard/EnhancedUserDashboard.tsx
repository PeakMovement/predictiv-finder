
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressTracker } from './ProgressTracker';
import { BookingManagement } from '../booking/BookingManagement';
import { UserDashboard } from './UserDashboard';
import { Calendar, TrendingUp, User, BookOpen } from 'lucide-react';

export const EnhancedUserDashboard: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Welcome to Predictiv Health</h2>
            <p className="text-muted-foreground mb-6">
              Sign in to access your personalized health dashboard, track progress, and manage appointments.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Health Dashboard</h1>
        <p className="text-muted-foreground">
          Track your progress, manage appointments, and view your health plans
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Progress</span>
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Appointments</span>
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Plans</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <UserDashboard />
        </TabsContent>

        <TabsContent value="progress">
          <ProgressTracker />
        </TabsContent>

        <TabsContent value="appointments">
          <BookingManagement />
        </TabsContent>

        <TabsContent value="plans">
          <Card>
            <CardHeader>
              <CardTitle>Health Plans</CardTitle>
              <CardDescription>
                View and manage your personalized health plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your health plans will appear here. Create a plan using our AI assistant to get started.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
