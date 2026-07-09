import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HUD = ({ speed, score, comboMultiplier, vehicle, altitude, onVehicleChange, gameState, tricksLanded }) => {
  const vehicles = [
    { id: 'bike', name: 'Mountain Bike', key: '1' },
    { id: 'snowboard', name: 'Snowboard', key: '2' },
    { id: 'wingsuit', name: 'Wingsuit', key: '3' }
  ];

  React.useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState !== 'playing') return;
      if (e.key === '1') onVehicleChange('bike');
      if (e.key === '2') onVehicleChange('snowboard');
      if (e.key === '3') onVehicleChange('wingsuit');
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, onVehicleChange]);

  return (
    <div className="hud-overlay" data-testid="hud-overlay">
      <div className="hud-top-left">
        <div className="hud-stat" data-testid="score-display">
          <span className="stat-label">SCORE</span>
          <span className="stat-value">{score.toLocaleString()}</span>
        </div>
        <div className="hud-stat" data-testid="tricks-display">
          <span className="stat-label">TRICKS</span>
          <span className="stat-value">{tricksLanded}</span>
        </div>
      </div>

      <div className="hud-top-center">
        <AnimatePresence>
          {comboMultiplier > 1 && (
            <motion.div
              className="combo-display"
              data-testid="combo-display"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="combo-text">COMBO</span>
              <span className="combo-multiplier">x{comboMultiplier}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="hud-bottom-left">
        <div className="vehicle-switcher" data-testid="vehicle-switcher">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className={`vehicle-item ${vehicle === v.id ? 'active' : ''}`}
              data-testid={`vehicle-${v.id}`}
            >
              <div className="vehicle-icon-small" data-vehicle={v.id}></div>
              <span className="vehicle-name">{v.name}</span>
              <span className="vehicle-key">{v.key}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="hud-bottom-right">
        <div className="speedometer" data-testid="speedometer">
          <span className="speed-value">{speed}</span>
          <span className="speed-unit">KM/H</span>
        </div>
        <div className="altitude-display" data-testid="altitude-display">
          <span className="altitude-label">ALT</span>
          <span className="altitude-value">{altitude}m</span>
        </div>
      </div>

      <div className="hud-controls-hint" data-testid="controls-hint">
        <span>Press <kbd>ESC</kbd> to pause • <kbd>I</kbd> for instructions</span>
      </div>
    </div>
  );
};

export default HUD;

