import React, { useState, useEffect } from 'react';
import Game3D from './components/Game3D';
import HUD from './components/HUD';
import InstructionsModal from './components/InstructionsModal';
import LeaderboardPanel from './components/LeaderboardPanel';
import './App.css';

function App() {
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused
  const [vehicle, setVehicle] = useState('bike'); // bike, snowboard, wingsuit
  const [speed, setSpeed] = useState(0);
  const [score, setScore] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [altitude, setAltitude] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [tricksLanded, setTricksLanded] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/leaderboard?limit=5`);
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const handleStartGame = () => {
    if (playerName.trim()) {
      setGameState('playing');
      setScore(0);
      setComboMultiplier(1);
      setSpeed(0);
      setTricksLanded(0);
      setMaxSpeed(0);
    }
  };

  const handleSubmitScore = async () => {
    if (score > 0 && playerName.trim()) {
      try {
        await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/scores`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            player_name: playerName,
            score: score,
            vehicle: vehicle,
            tricks_landed: tricksLanded,
            max_speed: maxSpeed
          })
        });
        fetchLeaderboard();
      } catch (error) {
        console.error('Failed to submit score:', error);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      if (gameState === 'playing') {
        setGameState('paused');
        setShowInstructions(true);
      } else if (gameState === 'paused') {
        setGameState('playing');
        setShowInstructions(false);
      }
    }
    if (e.key === 'i' || e.key === 'I') {
      setShowInstructions(!showInstructions);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, showInstructions]);

  if (gameState === 'menu') {
    return (
      <div className="menu-container" data-testid="menu-screen">
        <div className="menu-content">
          <h1 className="menu-title" data-testid="game-title">EXTREME REPUBLIC</h1>
          <p className="menu-subtitle">Conquer the mountains, master the extreme</p>
          <div className="menu-form">
            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="menu-input"
              data-testid="player-name-input"
              maxLength={20}
            />
            <button
              onClick={handleStartGame}
              className="menu-button"
              data-testid="start-game-button"
              disabled={!playerName.trim()}
            >
              START GAME
            </button>
            <button
              onClick={() => setShowInstructions(true)}
              className="menu-button-secondary"
              data-testid="show-instructions-button"
            >
              INSTRUCTIONS
            </button>
          </div>
          <div className="menu-vehicles">
            <div className="vehicle-preview" data-testid="vehicle-bike">
              <div className="vehicle-icon bike-icon"></div>
              <span>Mountain Bike</span>
            </div>
            <div className="vehicle-preview" data-testid="vehicle-snowboard">
              <div className="vehicle-icon snowboard-icon"></div>
              <span>Snowboard</span>
            </div>
            <div className="vehicle-preview" data-testid="vehicle-wingsuit">
              <div className="vehicle-icon wingsuit-icon"></div>
              <span>Wingsuit</span>
            </div>
          </div>
        </div>
        {showInstructions && (
          <InstructionsModal onClose={() => setShowInstructions(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="game-container" data-testid="game-container">
      <Game3D
        gameState={gameState}
        vehicle={vehicle}
        onVehicleChange={setVehicle}
        onSpeedChange={setSpeed}
        onScoreChange={setScore}
        onComboChange={setComboMultiplier}
        onAltitudeChange={setAltitude}
        onTrickLanded={() => setTricksLanded(prev => prev + 1)}
        onMaxSpeedChange={(s) => setMaxSpeed(prev => Math.max(prev, s))}
        score={score}
        comboMultiplier={comboMultiplier}
      />
      <HUD
        speed={speed}
        score={score}
        comboMultiplier={comboMultiplier}
        vehicle={vehicle}
        altitude={altitude}
        onVehicleChange={setVehicle}
        gameState={gameState}
        tricksLanded={tricksLanded}
      />
      <LeaderboardPanel leaderboard={leaderboard} />
      {showInstructions && (
        <InstructionsModal onClose={() => setShowInstructions(false)} />
      )}
      {gameState === 'paused' && (
        <div className="pause-overlay" data-testid="pause-overlay">
          <div className="pause-menu">
            <h2>PAUSED</h2>
            <button onClick={() => setGameState('playing')} data-testid="resume-button">RESUME</button>
            <button onClick={() => {
              handleSubmitScore();
              setGameState('menu');
            }} data-testid="quit-button">SAVE & QUIT</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

