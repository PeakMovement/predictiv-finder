import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Heart, Stethoscope, Users, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { PUBLIC_LAUNCH_MODE } from '@/config/launchMode';

interface HomeHeroProps {
  onNavigateToCategories: () => void;
  onNavigateToAI: () => void;
  onShowDashboard?: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  onNavigateToCategories,
  onNavigateToAI,
  onShowDashboard,
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const goToAssistant = () => navigate('/assistant');

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
            Your Personal
            <span className="text-primary block">Health Navigator</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Describe a health concern and get directional guidance, an estimated
            price range in Rand, and the type of specialist who typically helps.
          </p>
        </div>

        {/* Quick Access Dashboard for Authenticated Users */}
        {!PUBLIC_LAUNCH_MODE && isAuthenticated && onShowDashboard && (
          <Card className="max-w-md mx-auto bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <TrendingUp className="h-5 w-5" />
                Welcome Back!
              </CardTitle>
              <CardDescription>Continue tracking your health journey</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={onShowDashboard} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                View Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Main Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <Button
            size="lg"
            onClick={goToAssistant}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <Brain className="h-5 w-5" />
            Start with Predictiv
          </Button>
          {!PUBLIC_LAUNCH_MODE && (
            <Button
              size="lg"
              variant="outline"
              onClick={onNavigateToCategories}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold py-3 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              <Stethoscope className="h-5 w-5" />
              Browse Categories
            </Button>
          )}
        </div>
      </div>

      {/* Feature Cards */}
      {!PUBLIC_LAUNCH_MODE && (
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card
            className="text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
            onClick={goToAssistant}
          >
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="group-hover:text-primary transition-colors">AI-Powered Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Describe your health needs and get personalized recommendations powered by advanced AI.
              </CardDescription>
            </CardContent>
          </Card>

          <Link to="/professionals" className="block">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer group h-full">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">Expert Network</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Connect with healthcare practitioners listed in your area.
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link to="/success-stories" className="block">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer group h-full">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <Heart className="h-6 w-6 text-accent-foreground" />
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">Success Stories</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Read inspiring testimonials from people who transformed their health with personalized plans.
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}
    </div>
  );
};
