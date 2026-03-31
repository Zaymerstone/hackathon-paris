import { useState } from 'react';
import Welcome from './screens/Welcome';
import Onboarding from './screens/Onboarding';
import MatchFeed from './screens/MatchFeed';
import Activities from './screens/Activities';
import Profile from './screens/Profile';

type Screen = 'welcome' | 'onboarding' | 'matches' | 'activities' | 'profile';

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [selectedMatchId, setSelectedMatchId] = useState<string | undefined>();

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#0b1020' }}>
      {screen === 'welcome' && (
        <Welcome onNext={() => setScreen('onboarding')} />
      )}
      {screen === 'onboarding' && (
        <Onboarding
          onNext={() => setScreen('matches')}
          onBack={() => setScreen('welcome')}
        />
      )}
      {screen === 'matches' && (
        <MatchFeed
          onViewPlans={(matchId?: string) => { setSelectedMatchId(matchId); setScreen('activities'); }}
          onProfile={() => setScreen('profile')}
          setActiveTab={setScreen}
        />
      )}
      {screen === 'activities' && (
        <Activities
          matchId={selectedMatchId}
          onBack={() => setScreen('matches')}
          onProfile={() => setScreen('profile')}
        />
      )}
      {screen === 'profile' && (
        <Profile
          onMatches={() => setScreen('matches')}
          onActivities={() => setScreen('activities')}
        />
      )}
    </div>
  );
}
