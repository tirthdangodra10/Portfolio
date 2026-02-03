import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import '../css/App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Login from './components/Login';

function App() {
  const [session, setSession] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    // Simple Local Auth Check
    const localAuth = localStorage.getItem('portfolio_admin_auth');
    if (localAuth === 'true') {
      setSession({ user: { email: 'admin@portfolio.local' } }); // Mock session object
    }
  }, []);

  const handleLoginSuccess = () => {
    localStorage.setItem('portfolio_admin_auth', 'true');
    setSession({ user: { email: 'admin@portfolio.local' } });
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('portfolio_admin_auth');
    setSession(null);
    // Also sign out of supabase just in case, though we aren't using it for auth anymore
    supabase.auth.signOut();
  };

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="App">
      <Navbar session={session} onOpenLogin={() => setShowLogin(true)} onLogout={handleLogout} />
      <main id="home">
        <Hero session={session} />
        <div id="about" className="reveal">
          <About session={session} />
        </div>
        <div id="projects" className="reveal">
          <Projects session={session} />
        </div>
        <div id="contact" className="reveal">
          <Contact session={session} />
        </div>
      </main>
      <Footer />
      <Login isOpen={showLogin} onClose={() => setShowLogin(false)} onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}

export default App;
