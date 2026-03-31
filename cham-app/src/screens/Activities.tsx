import { useEffect, useState } from 'react';
import { fetchActivities, bookActivity } from '../lib/api';
import type { Activity } from '../lib/supabase';

const BADGE_COLORS: Record<string, string> = {
  'TOP PICK': '#7c4dff',
  'ACTIVE': '#262626',
  'FOODIE': '#262626',
  'CHILL': '#262626',
};
const BADGE_TEXT: Record<string, string> = {
  'TOP PICK': '#fff',
  'ACTIVE': '#9671ff',
  'FOODIE': '#9671ff',
  'CHILL': '#9671ff',
};
const CATEGORY_EMOJI: Record<string, string> = {
  Arts: '☕', Outdoor: '🥾', Food: '🍜', Productivity: '🍵',
};

function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#7c4dff', borderTopColor: 'transparent' }} />
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function Activities({ onBack, onProfile }: {
  onBack: () => void;
  onProfile: () => void;
  matchId?: string;
}) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booked, setBooked] = useState<Record<string, boolean>>({});
  const [booking, setBooking] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities()
      .then(setActivities)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleBook = async (activityId: string) => {
    setBooking(activityId);
    try {
      await bookActivity(activityId);
      setBooked(prev => ({ ...prev, [activityId]: true }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Booking failed';
      // Already booked is fine
      if (msg.includes('duplicate') || msg.includes('unique')) {
        setBooked(prev => ({ ...prev, [activityId]: true }));
      }
    } finally {
      setBooking(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0b1020' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: '#262626' }}>
        <button onClick={onBack} style={{ color: '#d4d4d4' }}>←</button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: '#7c4dff' }}>
            <span className="text-sm">🐾</span>
          </div>
          <span className="text-xl font-bold text-white">Cham</span>
        </div>
        <button onClick={onProfile} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#262626', border: '1px solid #404040' }}>
          <span style={{ color: '#7c4dff' }}>👤</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {/* AI Curated header */}
        <div className="flex items-center gap-3 mt-4">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: '#7c4dff' }}>
            <span>✨</span>
          </div>
          <div>
            <p className="font-bold text-white">AI-Curated Plans</p>
            <p className="text-xs" style={{ color: '#a3a3a3' }}>Tailored for you & your match group</p>
          </div>
        </div>

        {/* Location + verified */}
        <div className="mt-3 p-4 rounded-2xl flex items-center gap-2" style={{ background: '#171717', border: '1px solid #262626' }}>
          <span style={{ color: '#7c4dff' }}>📍</span>
          <span className="text-sm" style={{ color: '#d4d4d4' }}>Near <strong className="text-white">Williamsburg, Brooklyn</strong> · within 2 mi</span>
        </div>
        <div className="mt-2 p-3 rounded-2xl flex items-center gap-2" style={{ background: '#171717', border: '1px solid #262626' }}>
          <span style={{ color: '#4ade80' }}>🛡️</span>
          <span className="text-sm font-bold" style={{ color: '#4ade80' }}>All attendees verified</span>
          <div className="ml-auto flex gap-1">
            {['#7c4dff', '#9671ff', '#b094ff'].map((c, i) => (
              <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs" style={{ background: c }}>✓</div>
            ))}
          </div>
        </div>

        {loading && <Spinner />}
        {error && (
          <div className="mt-4 p-4 rounded-2xl text-sm" style={{ background: '#1a0a0a', border: '1px solid #7c2020', color: '#ff6b6b' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Activity cards */}
        {!loading && !error && (
          <div className="space-y-4 mt-4">
            {activities.map(a => {
              const isBooked = booked[a.id];
              const isBooking = booking === a.id;
              const emoji = CATEGORY_EMOJI[a.category] ?? '🎯';
              const badgeBg = BADGE_COLORS[a.badge_label] ?? '#262626';
              const badgeText = BADGE_TEXT[a.badge_label] ?? '#9671ff';

              return (
                <div key={a.id} className="rounded-3xl overflow-hidden" style={{ background: '#171717', border: '1px solid #262626' }}>
                  <div className="w-full h-36 flex items-center justify-center text-6xl" style={{ background: '#262626' }}>
                    {emoji}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-white text-lg flex-1 mr-2">{a.title}</p>
                      <span className="px-2 py-1 rounded-xl text-xs font-bold flex-shrink-0" style={{ background: badgeBg, color: badgeText }}>
                        {a.badge_label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-1 rounded-xl text-xs" style={{ background: '#262626', color: '#d4d4d4' }}>
                        🕐 {formatDate(a.scheduled_at)} · ~{a.duration_hrs}hrs
                      </span>
                      {a.venues && (
                        <span className="px-2 py-1 rounded-xl text-xs" style={{ background: '#262626', color: '#d4d4d4' }}>
                          📍 {a.venues.name}
                        </span>
                      )}
                      <span className="px-2 py-1 rounded-xl text-xs" style={{ background: '#262626', color: '#d4d4d4' }}>
                        👥 {a.group_min}–{a.group_max} people
                      </span>
                      {a.venues && (
                        <span className="px-2 py-1 rounded-xl text-xs" style={{ background: '#262626', color: '#d4d4d4' }}>
                          🏪 {a.venues.category}
                        </span>
                      )}
                    </div>

                    {/* Why Cham picked this */}
                    {a.ai_rationale && (
                      <div className="mt-3 p-3 rounded-2xl" style={{ background: '#120042', border: '1px solid #3500c7' }}>
                        <p className="text-xs font-bold" style={{ color: '#b094ff' }}>🤖 Why Cham picked this</p>
                        <p className="text-xs mt-1" style={{ color: '#d4d4d4' }}>{a.ai_rationale}</p>
                      </div>
                    )}

                    <button
                      onClick={() => handleBook(a.id)}
                      disabled={isBooked || isBooking}
                      className="w-full mt-3 py-3 rounded-2xl text-white font-bold transition-colors"
                      style={{ background: isBooked ? '#1b5e20' : isBooking ? '#4a2d99' : '#7c4dff' }}
                    >
                      {isBooked ? '✓ Spot Reserved!' : isBooking ? 'Reserving…' : 'Reserve Spot'}
                    </button>
                  </div>
                </div>
              );
            })}

            {activities.length === 0 && (
              <div className="text-center py-12" style={{ color: '#737373' }}>
                <p className="text-4xl mb-3">🗓️</p>
                <p>No activities yet — check back soon!</p>
              </div>
            )}
          </div>
        )}

        <button onClick={onBack} className="w-full text-center py-4 font-bold" style={{ color: '#7c4dff' }}>
          ← Back to Matches
        </button>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-around items-center py-3 border-t" style={{ background: '#0b1020', borderColor: '#262626' }}>
        <button onClick={onBack} className="flex flex-col items-center gap-1">
          <span className="text-2xl">🏠</span>
          <span className="text-xs font-bold" style={{ color: '#737373' }}>Home</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <span className="text-2xl">🧭</span>
          <span className="text-xs font-bold" style={{ color: '#7c4dff' }}>Activities</span>
        </button>
        <button onClick={onProfile} className="flex flex-col items-center gap-1">
          <span className="text-2xl">👤</span>
          <span className="text-xs font-bold" style={{ color: '#737373' }}>Profile</span>
        </button>
      </div>
    </div>
  );
}
