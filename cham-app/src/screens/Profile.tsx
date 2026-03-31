import { useEffect, useState } from 'react';
import { fetchProfile, fetchMyBookings } from '../lib/api';
import type { User, DigitalPortrait, VerificationRecord, EventBooking } from '../lib/supabase';

const DAYS = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];
const DAY_LABELS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const INTEREST_CLUSTERS = [
  { label: 'Coffee Spots', icon: '☕', color: '#ff6e40' },
  { label: 'Arts & Culture', icon: '🎨', color: '#e040fb' },
  { label: 'Nature', icon: '🌿', color: '#00e676' },
  { label: 'Wellness', icon: '🧘', color: '#40c4ff' },
  { label: 'Reading', icon: '📚', color: '#ffd740' },
  { label: 'Live Music', icon: '🎵', color: '#7c4dff' },
];

const ACTIVITY_TAGS = [
  { label: '☕ Coffee Hopping', color: '#7c4dff' },
  { label: '🎨 Gallery Walks', color: '#00bfa5' },
  { label: '🥾 Hiking', color: '#ff6e40' },
  { label: '🧘 Yoga', color: '#40c4ff' },
  { label: '📚 Book Clubs', color: '#e040fb' },
];

function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#7c4dff', borderTopColor: 'transparent' }} />
    </div>
  );
}

function formatBookingDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function Profile({ onMatches, onActivities }: {
  onMatches: () => void;
  onActivities: () => void;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [portrait, setPortrait] = useState<DigitalPortrait | null>(null);
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const [bookings, setBookings] = useState<EventBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchProfile(), fetchMyBookings()])
      .then(([profileData, bookingData]) => {
        setUser(profileData.user);
        setPortrait(profileData.portrait);
        setVerifications(profileData.verifications);
        setBookings(bookingData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const initials = user?.display_name.split(' ').map(n => n[0]).join('').slice(0, 2) ?? 'MT';
  const availability = portrait?.availability ?? {};
  const hasId = verifications.some(v => v.type === 'id_document' && v.status === 'verified');
  const hasSelfie = verifications.some(v => v.type === 'selfie' && v.status === 'verified');
  const hasCommunity = verifications.some(v => v.type === 'community' && v.status === 'verified');

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0b1020' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: '#262626' }}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: '#7c4dff' }}>
          <span className="text-lg">🐾</span>
        </div>
        <div>
          <p className="font-bold text-white">Your Digital Portrait</p>
          <p className="text-xs" style={{ color: '#a3a3a3' }}>Curated by Cham's AI companion</p>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div className="flex-1 overflow-y-auto px-4 pb-32">
          {/* Profile card */}
          <div className="mt-4 p-4 rounded-3xl" style={{ background: '#171717', border: '1px solid #262626' }}>
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
                style={{ background: '#7c4dff', border: '3px solid #7c4dff' }}>
                {initials}
              </div>
              <div>
                <p className="font-bold text-white text-lg">{user?.display_name ?? 'Marissa Trevino'}</p>
                <p className="text-xs" style={{ color: '#a3a3a3' }}>{user?.location ?? 'Portland, OR'} · Joined {user ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Nov 2024'}</p>
                <p className="text-xs font-bold mt-1" style={{ color: '#00e676' }}>✓ Verified</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="p-3 rounded-2xl text-center" style={{ background: '#262626' }}>
                <p className="text-xl font-bold" style={{ color: '#7c4dff' }}>{portrait?.social_energy_score ?? 78}%</p>
                <p className="text-xs" style={{ color: '#a3a3a3' }}>Social Energy</p>
              </div>
              <div className="p-3 rounded-2xl text-center" style={{ background: '#262626' }}>
                <p className="text-lg font-bold" style={{ color: '#ff6e40' }}>{portrait?.friendship_style ?? 'Explorer'}</p>
                <p className="text-xs" style={{ color: '#a3a3a3' }}>Friendship Style</p>
              </div>
              <div className="p-3 rounded-2xl text-center" style={{ background: '#262626' }}>
                <p className="text-xl font-bold" style={{ color: '#40c4ff' }}>{portrait?.ideal_group_min ?? 4}-{portrait?.ideal_group_max ?? 6}</p>
                <p className="text-xs" style={{ color: '#a3a3a3' }}>Ideal Group</p>
              </div>
            </div>

            {/* Activity tags */}
            <p className="text-sm font-bold mt-4 mb-2" style={{ color: '#d4d4d4' }}>Favorite Activities</p>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_TAGS.map(t => (
                <span key={t.label} className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: t.color }}>
                  {t.label}
                </span>
              ))}
            </div>

            {/* Meetup prefs */}
            <p className="text-sm font-bold mt-4 mb-2" style={{ color: '#d4d4d4' }}>Meetup Preferences</p>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-xl text-xs" style={{ background: '#262626', color: '#d4d4d4' }}>☀️ Weekends AM</span>
              <span className="px-3 py-1 rounded-xl text-xs" style={{ background: '#262626', color: '#d4d4d4' }}>🌙 Weekday Eves</span>
            </div>

            {/* Availability */}
            <p className="text-sm font-bold mt-4 mb-2" style={{ color: '#d4d4d4' }}>Availability</p>
            <div className="flex gap-1">
              {DAYS.map((d, i) => (
                <div key={d} className="flex-1 py-1 rounded-lg text-center text-xs font-bold"
                  style={{ background: availability[d] ? '#7c4dff' : '#262626', color: availability[d] ? '#fff' : '#a3a3a3' }}>
                  {DAY_LABELS[i]}
                </div>
              ))}
            </div>

            {/* Friendship intent */}
            {portrait?.friendship_intent && (
              <>
                <p className="text-sm font-bold mt-4 mb-1" style={{ color: '#d4d4d4' }}>Friendship Intent</p>
                <p className="text-xs" style={{ color: '#a3a3a3' }}>{portrait.friendship_intent}</p>
              </>
            )}
          </div>

          {/* Trust & Safety */}
          <div className="mt-4 p-4 rounded-3xl" style={{ background: '#171717', border: '1px solid #262626' }}>
            <p className="font-bold text-white flex items-center gap-2">🛡️ Trust & Safety</p>
            <div className="space-y-3 mt-3">
              {[
                { icon: '🪪', label: 'ID Verified', sub: 'Government ID confirmed', active: hasId },
                { icon: '📷', label: 'Selfie Verified', sub: 'Real-time photo match confirmed', active: hasSelfie },
                { icon: '👥', label: 'Community Trusted', sub: '3 positive meetup reviews', active: hasCommunity },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: item.active ? '#1b5e20' : '#262626' }}>
                    <span style={{ color: item.active ? '#00e676' : '#737373' }}>{item.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: item.active ? '#fff' : '#737373' }}>{item.label}</p>
                    <p className="text-xs" style={{ color: '#a3a3a3' }}>{item.sub}</p>
                  </div>
                  {item.active && <span className="ml-auto text-xs font-bold" style={{ color: '#00e676' }}>✓</span>}
                </div>
              ))}
            </div>
            <p className="text-xs mt-3" style={{ color: '#737373' }}>Your safety is our priority. All meetup partners are verified before matching.</p>
          </div>

          {/* Interest clusters */}
          <div className="mt-4 p-4 rounded-3xl" style={{ background: '#171717', border: '1px solid #262626' }}>
            <p className="font-bold text-white flex items-center gap-2">🎨 Interest Clusters</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {INTEREST_CLUSTERS.map(c => (
                <div key={c.label} className="flex items-center gap-2 px-3 py-2 rounded-2xl" style={{ background: '#262626' }}>
                  <span style={{ color: c.color }}>{c.icon}</span>
                  <span className="text-sm" style={{ color: '#e5e5e5' }}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming activities from DB */}
          <div className="mt-4 p-4 rounded-3xl" style={{ background: '#171717', border: '1px solid #262626' }}>
            <p className="font-bold text-white flex items-center gap-2">📅 Upcoming Activities</p>
            {bookings.length === 0 ? (
              <p className="text-sm mt-3" style={{ color: '#737373' }}>No bookings yet — reserve a spot!</p>
            ) : (
              <div className="space-y-3 mt-3">
                {bookings.map(b => {
                  const act = b.activities as (typeof b.activities & { venues?: { name: string } }) | undefined;
                  return (
                    <div key={b.id} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: '#262626' }}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: '#171717' }}>
                        🎯
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">{act?.title ?? 'Activity'}</p>
                        <p className="text-xs" style={{ color: '#a3a3a3' }}>{act?.scheduled_at ? formatBookingDate(act.scheduled_at) : ''}</p>
                        <p className="text-xs" style={{ color: '#737373' }}>{act?.venues?.name ?? ''}</p>
                      </div>
                      <span className="px-2 py-1 rounded-lg text-xs font-bold text-white"
                        style={{ background: b.status === 'confirmed' ? '#00bfa5' : '#7c4dff' }}>
                        {b.status === 'confirmed' ? 'Confirmed' : 'Booked'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Profile completeness */}
          <div className="mt-4 p-4 rounded-3xl" style={{ background: '#171717', border: '1px solid #262626' }}>
            <div className="flex justify-between items-center">
              <p className="font-bold text-white">Profile Completeness</p>
              <p className="font-bold" style={{ color: '#7c4dff' }}>{portrait?.completion_pct ?? 82}%</p>
            </div>
            <div className="mt-2 h-2 rounded-full" style={{ background: '#262626' }}>
              <div className="h-2 rounded-full" style={{ background: '#7c4dff', width: `${portrait?.completion_pct ?? 82}%` }} />
            </div>
            <p className="text-xs mt-2" style={{ color: '#a3a3a3' }}>
              Complete your portrait to improve match quality by up to 35%. Add a voice intro and 2 more interests!
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-4">
            <button onClick={onMatches} className="flex-1 py-3 rounded-2xl text-white font-bold" style={{ background: '#7c4dff' }}>
              Discover Matches
            </button>
            <button onClick={onActivities} className="flex-1 py-3 rounded-2xl font-bold" style={{ background: '#171717', border: '1px solid #404040', color: '#f5f5f5' }}>
              Activities
            </button>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-around items-center py-3 border-t" style={{ background: '#0b1020', borderColor: '#262626' }}>
        <button onClick={onMatches} className="flex flex-col items-center gap-1">
          <span className="text-2xl">🏠</span>
          <span className="text-xs font-bold" style={{ color: '#737373' }}>Home</span>
        </button>
        <button onClick={onActivities} className="flex flex-col items-center gap-1">
          <span className="text-2xl">🧭</span>
          <span className="text-xs font-bold" style={{ color: '#737373' }}>Activities</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <span className="text-2xl">👤</span>
          <span className="text-xs font-bold" style={{ color: '#7c4dff' }}>Profile</span>
        </button>
      </div>
    </div>
  );
}
