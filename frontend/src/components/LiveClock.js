import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateOpts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const dateStr = time.toLocaleDateString('en-IN', dateOpts);
  const timeStr = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        padding: '8px 18px',
        borderRadius: '20px',
        fontFamily: "'Outfit', sans-serif"
      }}
    >
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.45)' }}>
        {dateStr}
      </span>
      <span style={{ height: '14px', width: '1px', background: 'rgba(255, 255, 255, 0.1)' }}></span>
      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#4deaff', letterSpacing: '1px' }}>
        {timeStr}
      </span>
    </motion.div>
  );
};

export default LiveClock;
