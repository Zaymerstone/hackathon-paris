import { useState } from 'react';
import { saveOnboardingSession } from '../lib/api';

const questions = [
  {
    id: 'activities',
    question: "Hey there! 👋 Let's start easy — what kinds of activities make you lose track of time?",
    answer: "I love coffee walks, visiting galleries, and casual group hikes on weekends!",
    tags: ['☕ Coffee Walks', '🎨 Creative', '🌿 Outdoor Curious'],
    tagColors: ['#00c9db', '#b094ff', '#00e5a0'],
  },
  {
    id: 'energy',
    question: "Love that combo! 🎨 Now, how do you recharge — big group energy or smaller hangouts?",
    answer: "Definitely small groups — 3 to 5 people feels perfect for me.",
    tags: ['👥 Small Groups'],
    tagColors: ['#ff6b9d'],
  },
  {
    id: 'schedule',
    question: "When are you usually free to hang out? Weekdays, weekends, or evenings?",
    answer: "Weekend evenings are my sweet spot! Sometimes Saturday mornings for hikes.",
    tags: ['🌙 Weekend Evenings', '🌅 Sat Mornings'],
    tagColors: ['#6c63ff', '#00e5a0'],
  },
  {
    id: 'comfort',
    question: "Last one! How comfortable are you meeting someone new for the first time? Scale of 1-5? 🤝",
    answer: "I'd say a 4 — I'm open to it if the vibe feels right!",
    tags: ['🤝 Socially Open'],
    tagColors: ['#ffb74d'],
  },
];

const steps = ['Interests', 'Energy', 'Schedule', 'Style', 'Comfort'];

export default function Onboarding({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [step, setStep] = useState(0);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  const handleReveal = () => {
    if (!revealed.includes(step)) setRevealed([...revealed, step]);
  };

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const answers = questions.map(q => ({
        session_id: '',
        question_key: q.id,
        answer_text: q.answer,
        tags: q.tags,
      }));
      await saveOnboardingSession(answers);
    } catch (e) {
      console.error('Onboarding save error:', e);
    } finally {
      setSaving(false);
      onNext();
    }
  };

  const allTags = questions.slice(0, step + (revealed.includes(step) ? 1 : 0)).flatMap(q => q.tags);
  const progress = Math.round(((step + (revealed.includes(step) ? 1 : 0)) / questions.length) * 65);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0b1020' }}>
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b" style={{ borderColor: '#262626' }}>
        <button onClick={onBack} className="text-sm mr-4" style={{ color: '#a3a3a3' }}>← Back</button>
        <span className="text-lg font-bold text-white mx-auto">Cham</span>
      </div>

      {/* AI companion header */}
      <div className="mx-4 mt-4 p-4 rounded-2xl flex items-center gap-3" style={{ background: '#171717', border: '1px solid #262626' }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#1a1235', border: '1px solid #7c4dff' }}>
          <span className="text-2xl">🐾</span>
        </div>
        <div>
          <p className="font-bold text-white text-sm">Cham 🐾</p>
          <p className="text-xs" style={{ color: '#a3a3a3' }}>Your AI friendship guide</p>
        </div>
        <div className="ml-auto">
          <span className="text-xs font-bold" style={{ color: '#00e5a0' }}>● Online</span>
        </div>
      </div>

      {/* Intro + progress */}
      <div className="mx-4 mt-3 p-4 rounded-2xl" style={{ background: '#171717', border: '1px solid #262626' }}>
        <p className="text-sm" style={{ color: '#d4d4d4' }}>
          <span style={{ color: '#7c4dff' }}>Building your Digital Portrait</span> — I'll ask a few fun questions to understand who you are, what you love, and how you connect.
        </p>
        <div className="mt-3 h-2 rounded-full" style={{ background: '#262626' }}>
          <div className="h-2 rounded-full transition-all" style={{ background: '#7c4dff', width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-1">
          {steps.map((s, i) => (
            <span key={s} className="text-xs" style={{ color: i <= step ? '#7c4dff' : '#737373' }}>{s}</span>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 px-4 mt-4 space-y-4 overflow-y-auto pb-4">
        {questions.slice(0, step + 1).map((q, i) => (
          <div key={q.id}>
            <div className="flex gap-2 items-start">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#1a1235', border: '1px solid #7c4dff' }}>
                <span className="text-xs">🐾</span>
              </div>
              <div className="p-3 rounded-2xl rounded-tl-sm max-w-xs" style={{ background: '#262626', border: '1px solid #404040' }}>
                <p className="text-sm" style={{ color: '#f5f5f5' }}>{q.question}</p>
              </div>
            </div>
            {revealed.includes(i) && (
              <>
                <div className="flex justify-end mt-2">
                  <div className="p-3 rounded-2xl rounded-tr-sm max-w-xs" style={{ background: '#7c4dff' }}>
                    <p className="text-sm text-white">{q.answer}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2 justify-end">
                  {q.tags.map((tag, ti) => (
                    <span key={tag} className="text-xs font-bold" style={{ color: q.tagColors[ti] }}>{tag}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Safety note on last step */}
      {step === 3 && revealed.includes(3) && (
        <div className="mx-4 mb-3 p-4 rounded-2xl" style={{ background: '#171717', border: '1px solid #262626' }}>
          <p className="text-sm font-bold text-white">🛡️ You're in safe hands <span style={{ color: '#00e5a0' }}>✓</span></p>
          <p className="text-xs mt-2" style={{ color: '#d4d4d4' }}>
            Every member is <span style={{ color: '#00e5a0' }}>ID-verified</span> before meetups. Our AI moderation flags risks early.
          </p>
          <p className="text-xs mt-1" style={{ color: '#737373' }}>85% of meetups use verified ID badges</p>
        </div>
      )}

      {/* Portrait so far */}
      {allTags.length > 0 && (
        <div className="mx-4 mb-3 p-3 rounded-2xl" style={{ background: '#171717', border: '1px solid #404040' }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-white">Your Portrait So Far</span>
            <span className="text-sm font-bold" style={{ color: '#7c4dff' }}>{progress}% <span style={{ color: '#737373' }}>complete</span></span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => {
              const q = questions.find(q => q.tags.includes(tag));
              const color = q ? q.tagColors[q.tags.indexOf(tag)] : '#7c4dff';
              return <span key={tag} className="text-xs font-bold" style={{ color }}>{tag}</span>;
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pb-6 space-y-2">
        {!revealed.includes(step) ? (
          <button onClick={handleReveal} className="w-full py-3 rounded-2xl text-white font-bold" style={{ background: '#7c4dff' }}>
            Answer
          </button>
        ) : step < questions.length - 1 ? (
          <button onClick={handleNext} className="w-full py-3 rounded-2xl text-white font-bold" style={{ background: '#7c4dff' }}>
            Next Question →
          </button>
        ) : (
          <button onClick={handleFinish} disabled={saving} className="w-full py-4 rounded-2xl text-white text-lg font-bold" style={{ background: saving ? '#4a2d99' : '#7c4dff' }}>
            {saving ? 'Saving your portrait…' : 'Discover Your Matches'}
          </button>
        )}
      </div>
    </div>
  );
}
