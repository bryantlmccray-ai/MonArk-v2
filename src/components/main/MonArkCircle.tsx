import React from 'react';
import { Calendar, MapPin, Tag } from 'lucide-react';

interface CircleEvent {
  id: number;
  image: string;
  category: string;
  title: string;
  date: string;
  time: string;
  location: string;
  price: string;
}

// Events are updated periodically — dates reflect upcoming community gatherings.
// TODO: Replace with live Supabase query when circle_events table is ready.
function getUpcomingEvents(): CircleEvent[] {
  const now = new Date();
  const month = now.toLocaleString('default', { month: 'long' });
  const year = now.getFullYear();

  // Use rolling dates relative to current month
  const day = (offset: number) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  return [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop',
      category: 'Mindfulness',
      title: 'Morning Meditation in the Park',
      date: day(5),
      time: '8:00 AM',
      location: 'Wade Oval',
      price: 'Free',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=200&fit=crop',
      category: 'Connection',
      title: 'Authentic Conversation Circle',
      date: day(9),
      time: '7:00 PM',
      location: 'Ohio City',
      price: '$15',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=200&fit=crop',
      category: 'Wellness',
      title: 'Sound Bath & Intention Setting',
      date: day(14),
      time: '6:30 PM',
      location: 'Tremont',
      price: '$25',
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=200&fit=crop',
      category: 'Social',
      title: 'Intentional Speed Dating — MonArk Style',
      date: day(21),
      time: '6:00 PM',
      location: 'Gordon Square',
      price: '$20',
    },
  ];
}

export const MonArkCircle: React.FC = () => {
  const events = getUpcomingEvents();

  return (
    <div className="bg-background">
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground tracking-tight">MonArk Circle</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Curated community experiences</p>
        </div>

        {/* Coming soon notice */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex items-start gap-2.5">
          <Calendar className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-foreground">Circle events are coming soon</p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
              In-person gatherings curated for MonArk members — mindfulness, authentic conversation, and shared experiences.
              RSVP will be available here when events go live.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-card rounded-2xl overflow-hidden border border-border/60 hover:border-primary/20 transition-all duration-200 shadow-[0_1px_3px_rgba(100,80,60,0.04)] hover:shadow-[0_2px_8px_rgba(100,80,60,0.08)] group active:scale-[0.99]"
            >
              <div className="relative overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card/50 to-transparent" />
                <span className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
                  Coming Soon
                </span>
              </div>
              <div className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase">
                    {event.category}
                  </span>
                  <span className="text-primary font-bold text-sm">{event.price}</span>
                </div>
                <h3 className="text-foreground font-semibold text-base leading-snug">{event.title}</h3>
                <div className="flex justify-between text-muted-foreground text-xs">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {event.date} at {event.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {event.location}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
