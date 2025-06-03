
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Phone, Video, User } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface BookingDetails {
  id: string;
  practitionerName: string;
  practitionerType: string;
  date: Date;
  time: string;
  duration: number;
  type: 'in-person' | 'video' | 'phone';
  location?: string;
  status: 'upcoming' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  cost: number;
}

export const BookingManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    if (currentUser) {
      loadUserBookings();
    }
  }, [currentUser]);

  const loadUserBookings = () => {
    // Mock data - in real implementation, this would fetch from database
    setBookings([
      {
        id: '1',
        practitionerName: 'Dr. Sarah Johnson',
        practitionerType: 'General Practitioner',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        time: '10:00',
        duration: 30,
        type: 'in-person',
        location: '123 Health St, Cape Town',
        status: 'upcoming',
        cost: 350
      },
      {
        id: '2',
        practitionerName: 'Mark Williams',
        practitionerType: 'Physiotherapist',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        time: '14:30',
        duration: 45,
        type: 'video',
        status: 'upcoming',
        cost: 450
      },
      {
        id: '3',
        practitionerName: 'Lisa Chen',
        practitionerType: 'Nutritionist',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        time: '09:15',
        duration: 60,
        type: 'in-person',
        location: '456 Wellness Ave, Johannesburg',
        status: 'completed',
        cost: 500
      }
    ]);
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings(prev => 
      prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' as const }
          : booking
      )
    );
    toast({
      title: "Booking cancelled",
      description: "Your appointment has been cancelled successfully.",
    });
  };

  const handleRescheduleBooking = (bookingId: string) => {
    toast({
      title: "Reschedule requested",
      description: "We'll contact you to arrange a new time.",
    });
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return booking.status === 'upcoming';
    if (filter === 'completed') return booking.status === 'completed';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'rescheduled': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getAppointmentIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'in-person': return <MapPin className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p>Please sign in to view your bookings</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Appointments</h2>
        <div className="flex gap-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={filter === 'upcoming' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </Button>
          <Button 
            variant={filter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed')}
          >
            Completed
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <Card key={booking.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getAppointmentIcon(booking.type)}
                    {booking.practitionerName}
                  </CardTitle>
                  <CardDescription>{booking.practitionerType}</CardDescription>
                </div>
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(booking.date, 'EEEE, MMMM do, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{booking.time} ({booking.duration} minutes)</span>
                  </div>
                  {booking.location && (
                    <div className="flex items-center gap-2 md:col-span-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{booking.location}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="font-medium">Cost: R{booking.cost}</span>
                  {booking.status === 'upcoming' && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRescheduleBooking(booking.id)}
                      >
                        Reschedule
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No appointments found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
