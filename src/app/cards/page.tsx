'use client';

import React, { useState, useEffect } from 'react';
import { Shuffle, Clock } from 'lucide-react';
import dynamic from 'next/dynamic';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

const cardImages = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
  '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
  '🐧', '🐦', '🦆', '🦅', '🦉', '🐊', '🐺', '🐗'
];

interface Card {
  id: number;
  image: string;
}

type Difficulty = 'easy' | 'medium' | 'hard' | 'impossible';

const difficultySettings = {
  easy: { cards: 8, cols: 4, size: 'card-size-large' },
  medium: { cards: 16, cols: 4, size: 'card-size-medium' },
  hard: { cards: 24, cols: 6, size: 'card-size-small' },
  impossible: { cards: 48, cols: 8, size: 'card-size-tiny' }
};

const useTimer = (initialTime = 0) => {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const start = () => setIsRunning(true);
  const stop = () => setIsRunning(false);
  const reset = () => setTime(0);

  return { time, start, stop, reset, isRunning };
};

const MemoryGame: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const { time, start: startTimer, stop: stopTimer, reset: resetTimer, isRunning } = useTimer();
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    initializeGame();
  }, [difficulty]);

  const initializeGame = () => {
    setIsResetting(true);
    const { cards: cardCount } = difficultySettings[difficulty];
    const gameCards = cardImages.slice(0, cardCount / 2);
    const shuffledCards = [...gameCards, ...gameCards]
      .sort(() => Math.random() - 0.5)
      .map((image, index) => ({ id: index, image }));
    setCards(shuffledCards);
    setFlippedIndices([]);
    setMatchedPairs([]);
    setScore(0);
    setShowConfetti(false);
    resetTimer();
    stopTimer();
    setTimeout(() => setIsResetting(false), 100);
  };

  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2 || flippedIndices.includes(index) || matchedPairs.includes(index)) return;

    if (!isRunning) {
      startTimer();
    }

    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    if (newFlippedIndices.length === 2) {
      const [firstIndex, secondIndex] = newFlippedIndices;
      if (firstIndex !== undefined && secondIndex !== undefined &&
        cards[firstIndex] && cards[secondIndex] &&
        cards[firstIndex]?.image === cards[secondIndex]?.image) {
        setMatchedPairs(prev => [...prev, firstIndex, secondIndex]);
        setScore(prev => prev + 1);
        setFlippedIndices([]);
        if (matchedPairs.length + 2 === cards.length) {
          stopTimer();
          setShowConfetti(true);
        }
      } else {
        setTimeout(() => setFlippedIndices([]), 1000);
      }
    }
  };

  const isFlipped = (index: number) => flippedIndices.includes(index) || matchedPairs.includes(index);

  const { cols, size } = difficultySettings[difficulty];

  return (
    <div className="memory-game">
      {showConfetti && <Confetti />}
      <h1 className="game-title">Memory Game</h1>
      <div className="game-info">
        <span className="score">Score: {score}</span>
        <Clock className="clock-icon" />
        <span>{time}s</span>
      </div>
      <div className="difficulty-selector">
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          className="difficulty-select"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
          <option value="impossible">Impossible</option>
        </select>
      </div>
      <button onClick={initializeGame} className="new-game-button">
        <Shuffle className="shuffle-icon" /> New Game
      </button>
      <div className={`card-grid cols-${cols}`}>
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`card ${size} ${isFlipped(index) && !isResetting ? 'flipped' : ''}`}
            onClick={() => handleCardClick(index)}
          >
            <div className="card-inner">
              <div className="card-front">
                <div className="card-content">?</div>
              </div>
              <div className="card-back">
                <div className="card-content">{isResetting ? '?' : card.image}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemoryGame;