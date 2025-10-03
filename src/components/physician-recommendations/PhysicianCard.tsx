// PhysicianCard.tsx
import React, { useCallback } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MapPin,
  Clock,
  DollarSign,
  Star,
  Stethoscope,
  Calendar
} from 'lucide-react';
import { PhysicianRecommendation } from '@/services/physician-recommendation-service';

// (A) Let TypeScript know about the Calendly global
declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (opts: { url: string }) => void;
    };
  }
}

interface PhysicianCardProps {
  physician: PhysicianRecommendation & { Calendarlink?: string }; // ensure field exists
  onSelect: (physician: PhysicianRecommendation) => void;
}

// (B) Load Calendly assets once if they’re not present
const ensureCalendlyAssets = (): Promise<void> => {
  return new Promise((resolve) => {
    // CSS
    const cssHref = 'https://assets.calendly.com/assets/external/widget.css';
    if (!document.querySelector(`link[href="${cssHref}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssHref;
      document.head.appendChild(link);
    }

    // JS
    const jsSrc = 'https://assets.calendly.com/assets/external/widget.js';
    if (window.Calendly) return resolve(); // already loaded

    const existing = document.querySelector(`script[src="${jsSrc}"]`) as HTMLScriptElement | null;
    if (existing && (existing as any)._loaded) return resolve();

    const script = existing ?? document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = jsSrc;
    (script as any)._loaded = true;
    script.onload = () => resolve();
    if (!existing) document.body.appendChild(script);
  });
};

const PhysicianCard: React.FC<PhysicianCardProps> = ({ physician, onSelect }) => {
  const isAffordable = physician.affordability === 'Within budget';
  const initials = physician.Name.split(' ').map(n => n[0]).join('');

  // (C) Click handler: load Calendly, then open popup with physician-specific URL
  const handleSchedule = useCallback(async () => {
    // optional: keep your existing onSelect side-effect
    onSelect(physician);

    const url = physician.Calendarlink || 'https://calendly.com/madhur-yadav7/new-meeting'; // fallback
    await ensureCalendlyAssets();
    if (window.Calendly) {
      window.Calendly.initPopupWidget({ url });
    } else {
      console.error('Calendly failed to load.');
    }
  }, [physician, onSelect]);

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-health-purple/30 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 border-4 border-health-purple/20 group-hover:border-health-purple/40 transition-colors">
            <AvatarFallback className="bg-health-purple/10 text-health-purple font-bold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-health-purple transition-colors">
                {physician.Name}
              </h3>
              <Badge
                variant={isAffordable ? 'default' : 'secondary'}
                className={`${
                  isAffordable
                    ? 'bg-health-teal/10 text-health-teal border-health-teal/20 hover:bg-health-teal/20'
                    : 'bg-health-orange/10 text-health-orange border-health-orange/20 hover:bg-health-orange/20'
                } transition-colors font-semibold`}
              >
                {physician.affordability}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-health-purple font-semibold">
              <Stethoscope className="w-4 h-4" />
              <span className="text-sm">{physician.Title}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4 text-health-purple" />
            <span className="text-sm">
              <span className="font-semibold text-gray-900">{physician.Experience}</span> years
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4 text-health-purple" />
            <span className="text-sm font-medium text-gray-900">{physician.Location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-health-purple" />
            <span className="text-sm text-gray-600">Monthly Fee</span>
          </div>
          <span className="text-xl font-bold text-health-purple">R{physician.Price}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Star className="w-4 h-4 fill-health-orange text-health-orange" />
          <span className="text-sm">Highly rated specialist</span>
        </div>

        {physician.matchReason && (
          <div className="p-3 bg-health-purple/5 border border-health-purple/20 rounded-lg">
            <p className="text-sm text-health-purple font-medium">
              ✓ {physician.matchReason}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4">
        <Button
          onClick={handleSchedule}
          className="w-full bg-health-purple hover:bg-health-purple-dark text-white hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg group-hover:shadow-xl"
          size="lg"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Appointment
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PhysicianCard;
