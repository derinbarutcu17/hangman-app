import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Plus, Minus, Space } from 'lucide-react';
import './App.css';

// Turkish keyboard layout
const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç'],
];

const MAX_WRONG_GUESSES = 6;
const SPACE_MARKER = 'SPACE_MARKER';

// Hangman SVG parts - drawn progressively
const HangmanParts = ({ wrongCount }) => {
  const parts = [
    // Head
    <motion.circle
      key="head"
      cx="70"
      cy="45"
      r="15"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    />,
    // Body
    <motion.line
      key="body"
      x1="70"
      y1="60"
      x2="70"
      y2="100"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    />,
    // Left arm
    <motion.line
      key="leftArm"
      x1="70"
      y1="70"
      x2="50"
      y2="85"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    />,
    // Right arm
    <motion.line
      key="rightArm"
      x1="70"
      y1="70"
      x2="90"
      y2="85"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    />,
    // Left leg
    <motion.line
      key="leftLeg"
      x1="70"
      y1="100"
      x2="50"
      y2="125"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    />,
    // Right leg
    <motion.line
      key="rightLeg"
      x1="70"
      y1="100"
      x2="90"
      y2="125"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    />,
  ];

  return (
    <svg className="hangman-svg" viewBox="0 0 140 160">
      {/* Gallows */}
      <line className="gallows" x1="20" y1="150" x2="100" y2="150" />
      <line className="gallows" x1="40" y1="150" x2="40" y2="10" />
      <line className="gallows" x1="40" y1="10" x2="70" y2="10" />
      <line className="gallows" x1="70" y1="10" x2="70" y2="30" />
      
      {/* Hangman parts based on wrong count */}
      <AnimatePresence>
        {parts.slice(0, wrongCount)}
      </AnimatePresence>
    </svg>
  );
};

// Setup screen for selecting letter count
const SetupScreen = ({ onSelect }) => (
  <motion.div
    className="setup-screen"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
  >
    <h1 className="setup-title">Sandbox Hangman</h1>
    <p className="setup-subtitle">How many letters in your word?</p>
    <div className="letter-count-selector">
      {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
        <motion.button
          key={num}
          className="count-btn"
          onClick={() => onSelect(num)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {num}
        </motion.button>
      ))}
    </div>
  </motion.div>
);

// Virtual keyboard component
const Keyboard = ({ selectedLetter, usedLetters, onKeyPress, onConfirm, onDiscard, onClear }) => (
  <div className="keyboard-container">
    {KEYBOARD_ROWS.map((row, rowIndex) => (
      <div key={rowIndex} className="keyboard-row">
        {rowIndex === 2 && (
          <button
            className="key action-key confirm"
            onClick={onConfirm}
            disabled={!selectedLetter}
          >
            ✓
          </button>
        )}
        {row.map((letter) => {
          const isSelected = selectedLetter === letter;
          const isUsed = usedLetters.includes(letter);
          return (
            <motion.button
              key={letter}
              className={`key ${isSelected ? 'selected' : ''} ${isUsed ? 'used' : ''}`}
              onClick={() => !isUsed && onKeyPress(letter)}
              disabled={isUsed}
              whileTap={{ scale: 0.95 }}
            >
              {letter}
            </motion.button>
          );
        })}
        {rowIndex === 2 && (
          <>
            <button
              className="key action-key discard"
              onClick={onDiscard}
              disabled={!selectedLetter}
            >
              ✕
            </button>
            <button
              className="key action-key clear"
              onClick={onClear}
              title="Clear All"
            >
              ⟲
            </button>
          </>
        )}
      </div>
    ))}
  </div>
);

// Game over modal
const GameOverModal = ({ won, onPlayAgain }) => (
  <motion.div
    className="game-over-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="game-over-modal"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <h2>{won ? '🎉 Congratulations!' : '💀 Game Over'}</h2>
      <p>{won ? 'You filled all the blanks!' : 'The hangman is complete...'}</p>
      <button className="play-again-btn" onClick={onPlayAgain}>
        Play Again
      </button>
    </motion.div>
  </motion.div>
);

function App() {
  const [letterCount, setLetterCount] = useState(null);
  const [blanks, setBlanks] = useState([]);
  const [selectedBlankIndex, setSelectedBlankIndex] = useState(null);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [graveyard, setGraveyard] = useState([]);

  // Sync letterCount with blanks length automatically
  useEffect(() => {
    if (blanks.length > 0) {
      setLetterCount(blanks.length);
    }
  }, [blanks]);

  const wrongCount = graveyard.length;
  const isGameOver = wrongCount >= MAX_WRONG_GUESSES;
  
  // Win condition: All non-space blanks are filled
  const isWon = letterCount && blanks.every((b) => b !== null);

  const handleSelectLetterCount = useCallback((count) => {
    setLetterCount(count);
    setBlanks(Array(count).fill(null));
    setSelectedBlankIndex(null);
    setSelectedLetter(null);
    setGraveyard([]);
  }, []);

  const handleReset = useCallback(() => {
    setLetterCount(null);
    setBlanks([]);
    setSelectedBlankIndex(null);
    setSelectedLetter(null);
    setGraveyard([]);
  }, []);

  const handleBlankTap = useCallback((index) => {
    const currentLetter = blanks[index];
    
    // Ignore taps on spaces
    if (currentLetter === SPACE_MARKER) return;

    if (currentLetter !== null) {
      // Remove the letter from the blank
      const newBlanks = [...blanks];
      newBlanks[index] = null;
      setBlanks(newBlanks);
      return;
    }
    setSelectedBlankIndex(selectedBlankIndex === index ? null : index);
  }, [blanks, selectedBlankIndex]);

  const handleKeyPress = useCallback((letter) => {
    if (graveyard.includes(letter)) return;
    setSelectedLetter(selectedLetter === letter ? null : letter);
  }, [selectedLetter, graveyard]);

  const handleConfirm = useCallback(() => {
    if (!selectedLetter || selectedBlankIndex === null) return;
    
    // Fill the blank with the selected letter
    const newBlanks = [...blanks];
    newBlanks[selectedBlankIndex] = selectedLetter;
    setBlanks(newBlanks);
    
    // Clear selections
    setSelectedLetter(null);
    setSelectedBlankIndex(null);
  }, [selectedLetter, selectedBlankIndex, blanks]);

  const handleDiscard = useCallback(() => {
    if (!selectedLetter) return;
    
    // Add to graveyard
    setGraveyard([...graveyard, selectedLetter]);
    
    // Clear selection
    setSelectedLetter(null);
  }, [selectedLetter, graveyard]);

  const handleGraveyardTap = useCallback((letter, index) => {
    // Remove the letter from graveyard
    const newGraveyard = graveyard.filter((_, i) => i !== index);
    setGraveyard(newGraveyard);
  }, [graveyard]);

  const handleClearAll = useCallback(() => {
    // Clear all blanks (preserve spaces)
    setBlanks(blanks.map(b => b === SPACE_MARKER ? SPACE_MARKER : null));
    // Clear graveyard
    setGraveyard([]);
    // Clear selections
    setSelectedLetter(null);
    setSelectedBlankIndex(null);
  }, [blanks, letterCount]);

  const handleAddLetter = useCallback(() => {
    setBlanks(prev => [...prev, null]);
  }, []);

  const handleAddSpace = useCallback(() => {
    setBlanks(prev => [...prev, SPACE_MARKER]);
  }, []);

  const handleRemoveLetter = useCallback(() => {
    if (blanks.length <= 1) return;
    
    // Remove last item
    const newBlanks = blanks.slice(0, -1);
    setBlanks(newBlanks);
    
    // If the removed blank was selected, deselect
    if (selectedBlankIndex === blanks.length - 1) {
      setSelectedBlankIndex(null);
    }
  }, [blanks, selectedBlankIndex]);

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        {!letterCount ? (
          <SetupScreen key="setup" onSelect={handleSelectLetterCount} />
        ) : (
          <motion.div
            key="game"
            className="game-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header with Graveyard and Controls */}
            <div className="game-header">
              <div className="graveyard">
                <AnimatePresence>
                  {graveyard.map((letter, index) => (
                    <motion.div
                      key={`${letter}-${index}`}
                      className="graveyard-letter"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      onClick={() => handleGraveyardTap(letter, index)}
                      whileTap={{ scale: 0.9 }}
                    >
                      {letter}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              <div className="controls-group">
                <button 
                  className="control-btn minus" 
                  onClick={handleRemoveLetter}
                  disabled={blanks.length <= 1}
                  title="Remove Last"
                >
                  <Minus size={18} />
                </button>
                <button 
                  className="control-btn space" 
                  onClick={handleAddSpace}
                  disabled={blanks.length >= 20}
                  title="Add Space"
                >
                  <Space size={16} />
                </button>
                <button 
                  className="control-btn plus" 
                  onClick={handleAddLetter}
                  disabled={blanks.length >= 20}
                  title="Add Letter"
                >
                  <Plus size={18} />
                </button>
                <button className="control-btn reset-btn" onClick={handleReset} title="New Game">
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>

            {/* Hangman Drawing */}
            <div className="hangman-container">
              <HangmanParts wrongCount={wrongCount} />
            </div>

            {/* Word Blanks */}
            <div className="word-controls-container">
              <div className="word-container">
                <div className="word-blanks">
                  {blanks.map((item, index) => {
                    if (item === SPACE_MARKER) {
                      return (
                        <div key={index} className="word-spacer"></div>
                      );
                    }
                    
                    return (
                      <motion.div
                        key={index}
                        className={`letter-blank ${selectedBlankIndex === index ? 'selected' : ''} ${item ? 'filled' : ''}`}
                        onClick={() => handleBlankTap(index)}
                        whileTap={{ scale: 0.95 }}
                        layout
                      >
                        {item ? (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                          >
                            {item}
                          </motion.span>
                        ) : (
                          <span className="underscore" />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Virtual Keyboard */}
            <Keyboard
              selectedLetter={selectedLetter}
              usedLetters={graveyard}
              onKeyPress={handleKeyPress}
              onConfirm={handleConfirm}
              onDiscard={handleDiscard}
              onClear={handleClearAll}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Modal */}
      <AnimatePresence>
        {(isGameOver || isWon) && (
          <GameOverModal won={isWon} onPlayAgain={handleReset} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
