"use client";

import React, { useState, useEffect } from 'react';
import { Shuffle, Clock } from 'lucide-react';
import Confetti from 'react-confetti';

const cardImages = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'
];

const useTimer = (initialTime = 0) => {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval;
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

const MemoryGame = () => {
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const { time, start: startTimer, stop: stopTimer, reset: resetTimer, isRunning } = useTimer();

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffledCards = [...cardImages, ...cardImages]
      .sort(() => Math.random() - 0.5)
      .map((image, index) => ({ id: index, image }));
    setCards(shuffledCards);
    setFlippedIndices([]);
    setMatchedPairs([]);
    setScore(0);
    setShowConfetti(false);
    resetTimer();
    stopTimer();
  };

  const handleCardClick = (index) => {
    if (flippedIndices.length === 2 || flippedIndices.includes(index) || matchedPairs.includes(index)) return;

    if (!isRunning) {
      startTimer();
    }

    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    if (newFlippedIndices.length === 2) {
      const [firstIndex, secondIndex] = newFlippedIndices;
      if (cards[firstIndex].image === cards[secondIndex].image) {
        const newMatchedPairs = [...matchedPairs, firstIndex, secondIndex];
        setMatchedPairs(newMatchedPairs);
        setScore(score + 1);
        setFlippedIndices([]);

        if (newMatchedPairs.length === cards.length) {
          stopTimer();
          setShowConfetti(true);
        }
      } else {
        setTimeout(() => setFlippedIndices([]), 1000);
      }
    }
  };

  const isFlipped = (index) => flippedIndices.includes(index) || matchedPairs.includes(index);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      {showConfetti && <Confetti />}
      <h1 className="text-4xl font-bold mb-6 text-white">Memory Game</h1>
      <div className="mb-4 text-2xl text-white flex items-center">
        <span className="mr-4">Score: {score}</span>
        <Clock className="mr-2" />
        <span>{time}s</span>
      </div>
      <button
        onClick={initializeGame}
        className="mb-8 px-6 py-3 bg-yellow-400 text-blue-900 rounded-full hover:bg-yellow-300 transition-colors flex items-center text-lg font-semibold"
      >
        <Shuffle className="mr-2" /> New Game
      </button>
      <div className="grid grid-cols-4 gap-6 perspective-1000">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`w-24 h-24 cursor-pointer ${isFlipped(index) ? 'flipped' : ''}`}
            onClick={() => handleCardClick(index)}
          >
            <div className="flip-card-inner w-full h-full">
              <div className="flip-card-front">
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-white text-3xl shadow-lg">
                  ?
                </div>
              </div>
              <div className="flip-card-back">
                <div className="w-full h-full bg-white rounded-xl border-4 border-yellow-400 flex items-center justify-center text-5xl shadow-lg">
                  {card.image}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemoryGame;