import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { supabase } from './lib/supabaseClient';

function App() {
  const [view, setView] = useState('landing'); // landing, auth, dashboard
  const [session, setSession] = useState(null);
  const [authInitialMode, setAuthInitialMode] = useState('signin');

  // Check Supabase Session & URL Hash on mount
  useEffect(() => {
    const isRecovery = window.location.hash && window.location.hash.includes('type=recovery');
    if (isRecovery) {
      setAuthInitialMode('update_password');
      setView('auth');
    }

    // Auth session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session && !isRecovery) {
        setView('dashboard');
      }
    });

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'PASSWORD_RECOVERY') {
        setAuthInitialMode('update_password');
        setView('auth');
      } else if (session && !isRecovery) {
        setView('dashboard');
      } else if (!session) {
        setView('landing');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleConsoleNavigation = () => {
    if (session) {
      setView('dashboard');
    } else {
      setAuthInitialMode('signin');
      setView('auth');
    }
  };

  // Render Dashboard
  if (view === 'dashboard' && session) {
    return (
      <Dashboard 
        session={session} 
        onLogout={() => {
          setSession(null);
          setView('landing');
        }} 
      />
    );
  }

  // Render Authentication
  if (view === 'auth') {
    return (
      <Auth 
        initialMode={authInitialMode}
        onAuthSuccess={(newSession) => {
          setSession(newSession);
          setView('dashboard');
        }}
        onBackToLanding={() => setView('landing')}
      />
    );
  }

  // Default: Render Landing Page
  return <LandingPage onNavigateToAuth={handleConsoleNavigation} />;
}

export default App;
