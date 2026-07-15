import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { supabase } from './lib/supabaseClient';

function App() {
  const [view, setView] = useState('landing'); // landing, auth, dashboard
  const [session, setSession] = useState(null);

  // Check Supabase Session on mount
  useEffect(() => {
    // Auth session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setView('dashboard');
      }
    });

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setView('dashboard');
      } else {
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
