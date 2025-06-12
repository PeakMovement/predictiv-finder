
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ArrowLeft, Star, TrendingUp, Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const SuccessStories: React.FC = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      age: 32,
      location: "Cape Town",
      condition: "Chronic back pain",
      result: "Pain reduced by 80% in 3 months",
      quote: "The AI matched me with the perfect physiotherapist and created a plan that actually worked for my lifestyle. I can finally sleep through the night without pain.",
      image: "/placeholder.svg",
      rating: 5,
      timeframe: "3 months",
      professionals: ["Physiotherapist", "Biokineticist"]
    },
    {
      name: "Michael Chen",
      age: 45,
      location: "Johannesburg",
      condition: "Weight management",
      result: "Lost 25kg sustainably",
      quote: "The personalized nutrition and fitness plan was exactly what I needed. Having everything coordinated made all the difference. I've kept the weight off for over a year now.",
      image: "/placeholder.svg",
      rating: 5,
      timeframe: "8 months",
      professionals: ["Dietician", "Personal Trainer", "Life Coach"]
    },
    {
      name: "Emma Williams",
      age: 28,
      location: "Durban",
      condition: "Anxiety and stress",
      result: "Significant improvement in mental health",
      quote: "The integrated approach combining therapy, nutrition, and exercise helped me get my life back on track. I feel like myself again.",
      image: "/placeholder.svg",
      rating: 5,
      timeframe: "4 months",
      professionals: ["Psychologist", "Nutritionist", "Yoga Instructor"]
    },
    {
      name: "David Robinson",
      age: 38,
      location: "Pretoria",
      condition: "Marathon training injury",
      result: "Returned to running stronger than before",
      quote: "After my injury, I thought my running days were over. The coordinated care plan not only got me back to running but made me a better athlete.",
      image: "/placeholder.svg",
      rating: 5,
      timeframe: "6 months",
      professionals: ["Sports Medicine Doctor", "Physiotherapist", "Running Coach"]
    },
    {
      name: "Lisa Thompson",
      age: 41,
      location: "Port Elizabeth",
      condition: "Diabetes management",
      result: "HbA1c reduced from 9.2% to 6.8%",
      quote: "The comprehensive approach to managing my diabetes has been life-changing. I finally feel in control of my health.",
      image: "/placeholder.svg",
      rating: 5,
      timeframe: "5 months",
      professionals: ["Endocrinologist", "Dietician", "Exercise Physiologist"]
    },
    {
      name: "James Parker",
      age: 35,
      location: "Bloemfontein",
      condition: "Work-related stress and burnout",
      result: "Improved work-life balance and energy levels",
      quote: "The holistic approach helped me address not just the symptoms but the root causes of my burnout. I'm more productive and happier than ever.",
      image: "/placeholder.svg",
      rating: 4,
      timeframe: "3 months",
      professionals: ["Life Coach", "Nutritionist", "Massage Therapist"]
    }
  ];

  const stats = [
    { label: "Success Rate", value: "94%", icon: TrendingUp },
    { label: "Average Time to Results", value: "4.2 months", icon: Calendar },
    { label: "Professionals Involved", value: "500+", icon: Users },
    { label: "Happy Clients", value: "2,500+", icon: Heart }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-blue-light via-health-teal-light to-health-purple-light">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-health-orange/10 rounded-full mb-6">
            <Heart className="h-8 w-8 text-health-orange" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Success Stories
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real people, real results. Discover how our personalized health plans 
            have transformed lives across South Africa.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-health-purple/10 rounded-full mb-4">
                  <stat.icon className="h-6 w-6 text-health-purple" />
                </div>
                <div className="text-2xl font-bold text-health-purple mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="h-full hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                    <CardDescription>
                      {testimonial.age} years old • {testimonial.location}
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-health-orange text-health-orange" />
                  ))}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 italic">"{testimonial.quote}"</p>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Condition:</span>
                    <p className="text-sm text-gray-600">{testimonial.condition}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-health-orange">Result:</span>
                    <p className="text-sm font-medium text-health-orange">{testimonial.result}</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-700">Timeframe:</span>
                    <p className="text-sm text-gray-600">{testimonial.timeframe}</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-700">Professionals involved:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {testimonial.professionals.map((prof, i) => (
                        <span key={i} className="text-xs bg-health-purple/10 text-health-purple px-2 py-1 rounded">
                          {prof}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="max-w-2xl mx-auto bg-health-purple/5 border-health-purple/20">
            <CardHeader>
              <CardTitle className="text-2xl text-health-purple">
                Ready to Start Your Success Story?
              </CardTitle>
              <CardDescription className="text-lg">
                Join thousands of others who have transformed their health with personalized care plans.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/">
                  <Button size="lg" className="bg-health-purple hover:bg-health-purple-dark">
                    Get Started Today
                  </Button>
                </Link>
                <Link to="/professionals">
                  <Button size="lg" variant="outline" className="border-health-purple text-health-purple hover:bg-health-purple hover:text-white">
                    Meet Our Professionals
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SuccessStories;
