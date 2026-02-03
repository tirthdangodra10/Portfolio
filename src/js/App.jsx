import React, { useEffect } from 'react';
import '../css/App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
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
      <Navbar />
      <main id="home">
        <Hero />
        <div id="about" className="reveal">
          <About />
        </div>
        <div id="projects" className="reveal">
          <Projects />
        </div>
        <div id="contact" className="reveal">
          <Contact />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
