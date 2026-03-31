export default function Welcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#0b1020' }}>
      {/* Decorative circles */}
      <div className="absolute rounded-full" style={{ width: 180, height: 180, background: 'rgba(124,77,255,0.2)', top: 84, left: '50%', transform: 'translateX(-50%)' }} />
      <div className="absolute rounded-full" style={{ width: 120, height: 120, background: 'rgba(255,109,58,0.15)', top: 80, left: '50%', transform: 'translateX(-40%)' }} />
      <div className="absolute rounded-full" style={{ width: 90, height: 90, background: 'rgba(176,148,255,0.1)', top: 170, left: '55%' }} />

      {/* Logo area */}
      <div className="relative z-10 flex flex-col items-center mt-8">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-2" style={{ background: 'rgba(124,77,255,0.15)' }}>
          <span className="text-4xl">🐾</span>
        </div>
        <h1 className="text-5xl font-bold text-white mt-2">Cham</h1>
        <p className="text-center font-bold mt-4 text-lg" style={{ color: '#b094ff' }}>
          Authentic friendships through<br />shared activities
        </p>
        <p className="text-center text-sm mt-3 px-4" style={{ color: '#a3a3a3' }}>
          Not a dating app. Not a group chat.<br />
          A smarter way to meet real people for<br />
          real-world meetups that actually matter.
        </p>
      </div>

      {/* Value props */}
      <div className="flex flex-wrap justify-center gap-2 mt-6 z-10">
        <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm" style={{ background: '#171717', border: '1px solid #262626', color: '#d4d4d4' }}>
          🛡️ <strong>ID Verified</strong>
        </span>
        <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm" style={{ background: '#171717', border: '1px solid #262626', color: '#d4d4d4' }}>
          🧠 <strong>AI Matched</strong>
        </span>
        <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm" style={{ background: '#171717', border: '1px solid #262626', color: '#d4d4d4' }}>
          🥾 <strong>Activity-Led</strong>
        </span>
      </div>

      {/* CTA */}
      <button
        onClick={onNext}
        className="w-full mt-8 py-4 rounded-2xl text-white text-lg font-bold z-10"
        style={{ background: '#7c4dff', maxWidth: 327 }}
      >
        Begin Your Journey
      </button>

      <p className="text-xs mt-4 z-10" style={{ color: '#737373' }}>
        Join 12,000+ people building real friendships
      </p>
    </div>
  );
}
