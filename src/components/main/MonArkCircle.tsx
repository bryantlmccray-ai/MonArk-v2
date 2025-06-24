
import React from 'react';

export const MonArkCircle: React.FC = () => {
  const events = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop',
      category: 'Mindfulness',
      title: 'Morning Meditation in the Park',
      date: 'March 15',
      time: '8:00 AM',
      location: 'Wade Oval',
      price: 'Free',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=200&fit=crop',
      category: 'Connection',
      title: 'Authentic Conversation Circle',
      date: 'March 18',
      time: '7:00 PM',
      location: 'Ohio City',
      price: '$15',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop',
      category: 'Wellness',
      title: 'Sound Bath & Intention Setting',
      date: 'March 22',
      time: '6:30 PM',
      location: 'Tremont',
      price: '$25',
    },
  ];

  return (
    <div className="min-h-screen bg-jet-black p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-light text-white">MonArk Circle</h1>
          <p className="text-gray-400 text-sm mt-1">Curated community experiences</p>
        </div>

        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-charcoal-gray rounded-xl overflow-hidden border border-gray-800 hover:border-goldenrod/30 transition-all duration-300 hover:shadow-glow"
            >
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-32 object-cover"
              />
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-goldenrod/20 text-goldenrod px-2 py-1 rounded-md text-xs font-medium">
                    {event.category}
                  </span>
                  <span className="text-goldenrod font-semibold text-sm">
                    {event.price}
                  </span>
                </div>
                
                <h3 className="text-white font-medium text-lg">
                  {event.title}
                </h3>
                
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>{event.date} • {event.time}</span>
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
