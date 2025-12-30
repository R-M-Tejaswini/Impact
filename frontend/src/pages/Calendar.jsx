import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Plus, X, Calendar as CalendarIcon } from 'lucide-react';
import { calendarAPI } from '../services/api';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'meeting',
    start_time: '',
    end_time: '',
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      // ✅ Get ALL events
      const response = await calendarAPI.getAll();
      const eventsData = Array.isArray(response.data) ? response.data : (response.data?.results || []);
      const formattedEvents = eventsData.map(event => ({
        ...event,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);
    const startStr = format(start, "yyyy-MM-dd'T'HH:mm");
    const endDate = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour
    const endStr = format(endDate, "yyyy-MM-dd'T'HH:mm");
    
    setFormData({
      ...formData,
      start_time: startStr,
      end_time: endStr,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await calendarAPI.create(formData);
      setFormData({
        title: '',
        description: '',
        event_type: 'meeting',
        start_time: '',
        end_time: '',
      });
      setShowForm(false);
      setSelectedDate(null);
      loadEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    }
  };

  const eventStyleGetter = (event) => {
    const colors = {
      meeting: { backgroundColor: 'hsl(var(--primary))' },
      deadline: { backgroundColor: 'hsl(var(--destructive))' },
      review: { backgroundColor: 'hsl(var(--accent))' },
      standup: { backgroundColor: 'hsl(var(--success))' },
      presentation: { backgroundColor: 'hsl(var(--warning))' },
      other: { backgroundColor: 'hsl(var(--muted))' },
    };
    return {
      style: colors[event.event_type] || colors.other,
    };
  };

  return (
    <AppLayout title="Calendar" subtitle="Track meetings, deadlines, and events">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-foreground">Event Calendar</h2>
        </div>
        <Button
          variant="default"
          className="gap-2"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Add Event'}
        </Button>
      </div>

      {/* Add Event Form */}
      {showForm && (
        <div className="bg-card rounded-xl p-6 card-shadow mb-6 animate-slide-up">
          <h3 className="text-lg font-semibold text-foreground mb-4">Create Event</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Event Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Team Stand-up"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                placeholder="Daily sync with the team"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Event Type *</label>
              <select
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
              >
                <option value="meeting">Meeting</option>
                <option value="deadline">Deadline</option>
                <option value="review">Code Review</option>
                <option value="standup">Stand-up</option>
                <option value="presentation">Presentation</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Start Time *</label>
                <Input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">End Time *</label>
                <Input
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="hero" className="w-full">
              Create Event
            </Button>
          </form>
        </div>
      )}

      {/* Calendar View */}
      <div className="bg-card rounded-xl p-6 card-shadow" style={{ height: '700px' }}>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          titleAccessor="title"
          style={{ height: '100%' }}
          onSelectSlot={handleSelectSlot}
          selectable
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day', 'agenda']}
          defaultView="week"
        />
      </div>

      {/* Legend */}
      <div className="mt-6 bg-card rounded-xl p-4 card-shadow">
        <h4 className="text-sm font-medium text-foreground mb-3">Event Types</h4>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--primary))' }}></div>
            <span className="text-sm text-muted-foreground">Meeting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--destructive))' }}></div>
            <span className="text-sm text-muted-foreground">Deadline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--accent))' }}></div>
            <span className="text-sm text-muted-foreground">Code Review</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--success))' }}></div>
            <span className="text-sm text-muted-foreground">Stand-up</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--warning))' }}></div>
            <span className="text-sm text-muted-foreground">Presentation</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}