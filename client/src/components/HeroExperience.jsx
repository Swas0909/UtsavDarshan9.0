import React, { Suspense } from 'react';
import { motion, useViewportScroll, useTransform } from 'framer-motion';
import '../styles/HeroExperience.css';

export default function HeroExperience() {
  const { scrollY } = useViewportScroll();
  const yTitle = useTransform(scrollY, [0, 400], [0, -40]);
  const ySpline = useTransform(scrollY, [0, 600], [0, -80]);

  function handleNearMe(e) {
    e.preventDefault();
    const btn = document.getElementById('nearMeBtn');
    const msg = document.getElementById('nearMeMsg');
    if (!navigator.geolocation) {
      msg.textContent = 'Geolocation not supported.';
      return;
    }
    btn.disabled = true;
    btn.innerText = 'Checking location...';
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        window.location.href = `/explore?lat=${lat}&lng=${lng}`;
      },
      () => {
        btn.disabled = false;
        btn.innerText = 'Near me';
        msg.textContent = 'Location permission required.';
      },
      { timeout: 10000 }
    );
  }

  return (
    <section className="hero-experience" aria-labelledby="hero-title">
      <div className="hero-overlay" />
      <motion.div
        className="hero-inner"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 18 },
          visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.12 } }
        }}
      >
        <motion.div className="hero-toplabel">Indian Culture</motion.div>

        <motion.h1 id="hero-title" className="hero-title" style={{ y: yTitle }}>
          UtsavDarshan
        </motion.h1>

        <motion.p className="hero-sub" style={{ y: yTitle }}>
          Welcome Tourists !! explore pandals and famous places with trusted locals. and have fun and blessed full journey In our country
        </motion.p>

        <motion.div className="hero-cta-row" style={{ y: yTitle }}>
          <button id="nearMeBtn" className="btn-nearme" onClick={handleNearMe}>Near me</button>
          <div id="nearMeMsg" className="near-msg" role="status" aria-live="polite" />
        </motion.div>

        <motion.div className="hero-social">
          <a aria-label="instagram" href="#" className="social-icon">
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#7A1F1F" d="M12 2.2..."/></svg>
          </a>
          <a aria-label="twitter" href="#" className="social-icon">
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#7A1F1F" d="M22.46 6..."/></svg>
          </a>
        </motion.div>
      </motion.div>

      {/* Lightweight decorative fallback instead of Spline */}
      <motion.div className="hero-spline-wrap" style={{ y: ySpline }}>
        <div className="spline-fallback" aria-hidden="true">
          {/* simple decorative SVG / gradient to mimic 3D box */}
          <svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="g1" x1="0" x2="1">
                <stop offset="0" stopColor="#FFF8ED" />
                <stop offset="1" stopColor="#FFF2E0" />
              </linearGradient>
            </defs>
            <rect x="10" y="10" rx="18" ry="18" width="380" height="380" fill="url(#g1)" stroke="rgba(250,200,120,0.18)" />
            <g transform="translate(40,40)">
              <circle cx="140" cy="100" r="48" fill="#F2C26A" opacity="0.95" />
              <ellipse cx="140" cy="165" rx="90" ry="18" fill="rgba(120,60,20,0.06)" />
            </g>
          </svg>
        </div>
      </motion.div>
    </section>
  );
}
