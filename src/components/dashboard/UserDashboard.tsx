
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { HealthPlansService } from '@/services/health-plans-service';
import { ProfileService } from '@/services/profile-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Clock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const UserDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [userPlans, setUserPlans] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    try {
      const [plans, userProfile] = await Promise.all([
        HealthPlansService.getUserHealthPlans(),
        ProfileService.getCurrentUserProfile()
      ]);
      
      setUserPlans(plans);
      setProfile(userProfile);
    } catch (error: any) {
      toast({
        title: "Failed to load dashboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-system-blue mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {profile?.full_name || currentUser?.email}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Here's an overview of your health journey
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userPlans.length}</div>
            <p className="text-xs text-muted-foreground">
              Health plans created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R{userPlans.reduce((sum, plan) => sum + (Number(plan.total_cost) || 0), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all plans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Member Since</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Recently'}
            </div>
            <p className="text-xs text-muted-foreground">
              Join date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Health Plans */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Your Health Plans</h2>
        {userPlans.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500 mb-4">No health plans created yet</p>
              <Button onClick={() => window.location.href = '/'}>
                Create Your First Plan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userPlans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {plan.description}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {plan.plan_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Total Cost:
                      </span>
                      <span className="font-semibold">R{Number(plan.total_cost).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Time Frame:
                      </span>
                      <span>{plan.time_frame}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Services:</span>
                      <span>{Array.isArray(plan.services) ? plan.services.length : 0}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      View Details
                    </Button>
                    <Button size="sm" className="flex-1">
                      Book Services
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
