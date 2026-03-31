import { useEffect, useState } from 'react';
import { fetchMatches } from '../lib/api';

type Screen = 'welcome' | 'onboarding' | 'matches' | 'activities' | 'profile';

const avatarColors = ['#7c4dff', '#00bfa5', '#ff6e40', '#40c4ff', '#e040fb'];

const INTEREST_TAGS: Record<string, { label: string; color: string }[]> = {
  default: [
    { label: '🎨 Design Exhibits', color: '#cbb8ff' },
    { label: '🥾 Trail Walks', color: '#86efac' },
    { label: '☕ Indie Cafés', color: '#fcd34d' },
    { label: '🎵 Live Music', color: '#d8b4fe' },
  ],
};

const WHY_MATCH = {
  interests: 94, social: 88, availability: 91, meetup: 90,
};

interface MatchUser {
  id: string;
  display_name: string;
  location?: string;
  compatibility_score: number;
  ai_rationale: string;
  verifications: { type: string; status: string }[];
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#7c4dff', borderTopColor: 'transparent' }} />
    </div>
  );
}

export default function MatchFeed({ onViewPlans, onProfile, setActiveTab }: {
  onViewPlans: (matchId?: string) => void;
  onProfile: () => void;
  setActiveTab: (s: Screen) => void;
}) {
  const [matches, setMatches] = useState<MatchUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMatches()
      .then(setMatches)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0b1020' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: '#262626' }}>
        <span className="text-xl" style={{ color: '#d4d4d4' }}>☰</span>
        <h3 className="text-xl font-bold text-white">Cham</h3>
        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#262626', border: '1px solid #404040' }}>
          <span style={{ color: '#7c4dff' }}>👤</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <div className="flex items-center justify-between mt-4 mb-3">
          <h3 className="text-xl font-bold text-white">Your Matches</h3>
          <span style={{ color: '#a3a3a3' }}>⚙️</span>
        </div>

        {loading && <Spinner />}
        {error && (
          <div className="p-4 rounded-2xl text-sm" style={{ background: '#1a0a0a', border: '1px solid #7c2020', color: '#ff6b6b' }}>
            ⚠️ Could not load matches: {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {matches.map((m, i) => {
              const isFirst = i === 0;
              const initials = m.display_name.split(' ').map(n => n[0]).join('').slice(0, 2);
              const hasId = m.verifications.some(v => v.type === 'id_document' && v.status === 'verified');
              const hasSelfie = m.verifications.some(v => v.type === 'selfie' && v.status === 'verified');
              const tags = INTEREST_TAGS.default;

              return (
                <div key={m.id} className="rounded-3xl p-4" style={{
                  background: '#171717',
                  border: `1px solid ${isFirst ? '#7c4dff' : '#262626'}`
                }}>
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                      style={{ background: avatarColors[i % avatarColors.length] }}>
                      {initials}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="font-bold text-white">{m.display_name}</span>
                        <span style={{ color: '#7c4dff' }}>✓</span>
                        {hasId && <span style={{ color: '#4ade80' }}>🪪</span>}
                        {hasSelfie && <span style={{ color: '#4ade80' }}>📷</span>}
                      </div>
                      <p className="text-xs mt-1" style={{ color: '#a3a3a3' }}>
                        {m.location ?? 'Brooklyn, NY'} · {hasSelfie ? 'Selfie verified' : 'ID verified'}
                      </p>
                    </div>
                    <div className="px-3 py-1 rounded-xl text-white font-bold text-sm flex-shrink-0" style={{ background: '#7c4dff' }}>
                      {m.compatibility_score}%
                    </div>
                  </div>

                  {/* Interest tags */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map(t => (
                      <span key={t.label} className="text-xs font-bold" style={{ color: t.color }}>{t.label}</span>
                    ))}
                  </div>

                  {/* Why you match (first card only) */}
                  {isFirst && (
                    <div className="mt-3 p-3 rounded-2xl" style={{ background: '#262626' }}>
                      <div className="flex items-center gap-1 mb-2">
                        <span style={{ color: '#7c4dff' }}>⭐</span>
                        <span className="text-sm font-bold" style={{ color: '#e5e5e5' }}>Why you match</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-xs" style={{ color: '#d4d4d4' }}>
                        <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: '#7c4dff' }}></span>Interests {WHY_MATCH.interests}%</span>
                        <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: '#4ade80' }}></span>Social Energy {WHY_MATCH.social}%</span>
                        <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: '#fbbf24' }}></span>Availability {WHY_MATCH.availability}%</span>
                        <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: '#f472b6' }}></span>Meetup Style {WHY_MATCH.meetup}%</span>
                      </div>
                      {m.ai_rationale && (
                        <p className="text-xs mt-2" style={{ color: '#a3a3a3' }}>{m.ai_rationale}</p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    <button onClick={() => onViewPlans(m.id)} className="flex-1 py-3 rounded-2xl text-white font-bold text-sm" style={{ background: '#7c4dff' }}>
                      View Suggested Plans
                    </button>
                    <button className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#262626', border: '1px solid #404040' }}>
                      <span style={{ color: '#7c4dff' }}>👤</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {matches.length === 0 && (
              <div className="text-center py-12" style={{ color: '#737373' }}>
                <p className="text-4xl mb-3">🐾</p>
                <p>No matches yet — complete your portrait to get matched!</p>
              </div>
            )}

            {matches.length > 0 && (
              <p className="text-center text-sm py-4" style={{ color: '#737373' }}>More matches coming soon!</p>
            )}
          </div>
        )}
      </div>

      <BottomNav onHome={() => setActiveTab('matches')} onExplore={() => {}} onProfile={onProfile} active="matches" />
    </div>
  );
}

function BottomNav({ active, onHome, onExplore, onProfile }: {
  active: string; onHome: () => void; onExplore: () => void; onProfile: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-around items-center py-3 border-t" style={{ background: '#0b1020', borderColor: '#262626', maxWidth: 480, margin: '0 auto' }}>
      <button onClick={onHome} className="flex flex-col items-center gap-1">
        <span className="text-2xl">🏠</span>
        <span className="text-xs font-bold" style={{ color: active === 'matches' ? '#7c4dff' : '#737373' }}>Home</span>
      </button>
      <button onClick={onExplore} className="flex flex-col items-center gap-1">
        <span className="text-2xl">🔍</span>
        <span className="text-xs font-bold" style={{ color: '#737373' }}>Explore</span>
      </button>
      <button onClick={onProfile} className="flex flex-col items-center gap-1">
        <span className="text-2xl">👤</span>
        <span className="text-xs font-bold" style={{ color: active === 'profile' ? '#7c4dff' : '#737373' }}>Profile</span>
      </button>
    </div>
  );
}
