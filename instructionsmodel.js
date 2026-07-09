import React from 'react';

const InstructionsModal = ({ onClose }) => {
  const controls = [
    { category: 'Movement', items: [
      { key: 'W', action: 'Move Forward' },
      { key: 'A', action: 'Move Left' },
      { key: 'S', action: 'Move Backward' },
      { key: 'D', action: 'Move Right' },
    ]},
    { category: 'Actions', items: [
      { key: 'SPACE', action: 'Jump / Boost' },
      { key: 'SHIFT', action: 'Perform Trick (in air)' },
    ]},
    { category: 'Vehicle Switch', items: [
      { key: '1', action: 'Mountain Bike' },
      { key: '2', action: 'Snowboard' },
      { key: '3', action: 'Wingsuit' },
    ]},
    { category: 'Camera', items: [
      { key: 'MOUSE', action: 'Look Around (Click to lock)' },
    ]},
    { category: 'Menu', items: [
      { key: 'ESC', action: 'Pause Game' },
      { key: 'I', action: 'Toggle Instructions' },
    ]}
  ];

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="instructions-modal">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} data-testid="close-instructions">&times;</button>
        <h2 className="modal-title">CONTROLS & INSTRUCTIONS</h2>
        <div className="instructions-grid">
          {controls.map((section, idx) => (
            <div key={idx} className="control-section" data-testid={`control-section-${section.category.toLowerCase().replace(' ', '-')}`}>
              <h3 className="control-category">{section.category}</h3>
              <div className="control-list">
                {section.items.map((item, i) => (
                  <div key={i} className="control-item">
                    <kbd className="control-key" data-testid={`key-${item.key.toLowerCase()}`}>{item.key}</kbd>
                    <span className="control-action">{item.action}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="tips-section">
          <h3 className="tips-title">PRO TIPS</h3>
          <ul className="tips-list">
            <li>Chain tricks together within 3 seconds to build combo multipliers (up to x10!)</li>
            <li>Use ramps (orange) to gain massive air for bigger tricks</li>
            <li>Each vehicle has different physics - Wingsuit flies longer, Bike is agile, Snowboard is fastest</li>
            <li>Press SHIFT while airborne to perform tricks - longer air time = higher scores</li>
            <li>Avoid obstacles (gray blocks) or lose your combo</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InstructionsModal;

