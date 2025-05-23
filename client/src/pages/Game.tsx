import React from 'react';
import { useGame } from '@/context/GameContext';
import { GameStatus } from '@/components/GameStatus';
import { RoundResults } from '@/components/RoundResults';
import { GameTabs } from '@/components/GameTabs';
import { ThemePicker } from '@/components/ThemePicker';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function Game() {
  const { 
    gameState, 
    username, 
    userWins, 
    isParticipating, 
    hasPicked, 
    userPick, 
    pickNumber,
    logout
  } = useGame();

  if (!gameState) return null;

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <header className="mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary text-center lg:text-left mb-4 lg:mb-0">
            10 seconds, 10 numbers, 1 pick
          </h1>
          <div className="flex items-center space-x-4">
            <div className="bg-card text-card-foreground rounded-lg shadow-md px-4 py-2">
              <span className="font-medium">Player:{" "}</span>
              <span className="font-bold text-primary">{username}</span>
            </div>
            <div className="bg-card text-card-foreground rounded-lg shadow-md px-4 py-2">
              <span className="font-medium">Wins:{" "}</span>
              <span className="font-bold text-green-500">{userWins}</span>
            </div>
            <div className="ml-2">
              <ThemePicker />
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={logout}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Game Status */}
      <GameStatus />
      
      {/* Gameplay Area */}
      <div className="mb-6 relative">
        {gameState.currentRound.active ? (
          <div className="bg-card text-card-foreground rounded-xl shadow-lg p-4">
            {/* If there's a current number to show */}
            {gameState.currentRound.displayedNumbers.length > 0 && !hasPicked && (
              <div className="flex flex-col items-center">
                <p className="text-center mb-4">Click the number to select it!</p>
                <div onClick={() => pickNumber(gameState.currentRound.id, gameState.currentRound.displayedNumbers[0])}
                     className="bg-card border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-colors w-32 h-32 rounded-xl flex items-center justify-center cursor-pointer shadow-lg">
                  <span className="text-6xl font-bold">{gameState.currentRound.displayedNumbers[0]}</span>
                </div>
              </div>
            )}
            
            {/* If there's no number yet */}
            {gameState.currentRound.displayedNumbers.length === 0 && !hasPicked && (
              <div className="text-center p-8">
                <p>Waiting for the first number to appear...</p>
                <div className="mt-4 flex justify-center">
                  <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                </div>
              </div>
            )}
            
            {/* User has picked */}
            {hasPicked && (
              <div className="text-center py-4">
                <div className="mb-4">
                  <p className="text-lg mb-2">You picked</p>
                  <div className="inline-block bg-primary text-primary-foreground w-24 h-24 rounded-xl flex items-center justify-center">
                    <span className="text-5xl font-bold">{userPick}</span>
                  </div>
                </div>
                <p>Waiting for the round to end...</p>
              </div>
            )}
          </div>
        ) : (
          <RoundResults />
        )}
      </div>
      
      {/* Tabs */}
      <GameTabs />
    </div>
  );
}
