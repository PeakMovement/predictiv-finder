import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Heart, Stethoscope, Users, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

interface HomeHeroProps {
  onNavigateToCategories: () => void;
  onNavigateToAI: () => void;
  onShowDashboard?: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({ 
  onNavigateToCategories, 
  onNavigateToAI,
  onShowDashboard 
}) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
            Your Personal
            <span className="text-health-purple block">Health Navigator</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get personalized health plans and connect with the right professionals 
            for your wellness journey using AI-powered recommendations.
          </p>
        </div>

        {/* Quick Access Dashboard for Authenticated Users */}
        {isAuthenticated && onShowDashboard && (
          <Card className="max-w-md mx-auto bg-health-purple/5 border-health-purple/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-health-purple">
                <TrendingUp className="h-5 w-5" />
                Welcome Back!
              </CardTitle>
              <CardDescription>
                Continue tracking your health journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={onShowDashboard}
                className="w-full bg-health-purple hover:bg-health-purple-dark"
              >
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
            onClick={onNavigateToAI}
            className="bg-health-purple hover:bg-health-purple-dark text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <Brain className="h-5 w-5" />
            AI Health Assistant
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={onNavigateToCategories}
            className="border-health-purple text-health-purple hover:bg-health-purple hover:text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <Stethoscope className="h-5 w-5" />
            Browse Categories
          </Button>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <Card 
          className="text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
          onClick={onNavigateToAI}
        >
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-health-teal/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-health-teal/20 transition-colors">
              <Brain className="h-6 w-6 text-health-teal" />
            </div>
            <CardTitle className="group-hover:text-health-teal transition-colors">AI-Powered Insights</CardTitle>
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
              <div className="mx-auto w-12 h-12 bg-health-purple/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-health-purple/20 transition-colors">
                <Users className="h-6 w-6 text-health-purple" />
              </div>
              <CardTitle className="group-hover:text-health-purple transition-colors">Expert Network</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Connect with verified healthcare professionals and wellness experts in your area.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link to="/success-stories" className="block">
          <Card className="text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer group h-full">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-health-orange/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-health-orange/20 transition-colors">
                <Heart className="h-6 w-6 text-health-orange" />
              </div>
              <CardTitle className="group-hover:text-health-orange transition-colors">Success Stories</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Read inspiring testimonials from people who transformed their health with personalized plans.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Statistics */}
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 mt-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Trusted by Health-Conscious Individuals</h2>
          <p className="text-gray-600">Join thousands who've improved their wellness journey</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-health-purple">500+</div>
            <div className="text-gray-600">Healthcare Professionals</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-health-teal">10k+</div>
            <div className="text-gray-600">Personalized Plans</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-health-orange">95%</div>
            <div className="text-gray-600">Satisfaction Rate</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-health-purple">24/7</div>
            <div className="text-gray-600">AI Support</div>
          </div>
        </div>
      </div>
    </div>
  );
};
