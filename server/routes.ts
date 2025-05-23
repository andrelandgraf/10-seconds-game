import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { gameManager } from "./gameManager";
import { getThemeFromCookie, setThemeCookie, clearThemeCookie, getUsernameFromCookie, setUsernameCookie, clearUsernameCookie } from "./cookie-utils";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Create WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Handle WebSocket connections
  wss.on('connection', (socket: WebSocket) => {
    gameManager.handleConnection(socket);
  });

  // REST API routes
  
  // Get current game state
  app.get('/api/game', async (req, res) => {
    try {
      const currentRound = await storage.getCurrentRound();
      const leaderboard = await storage.getLeaderboard();
      
      res.json({
        currentRound,
        leaderboard
      });
    } catch (error) {
      console.error('Error fetching game state:', error);
      res.status(500).json({ error: 'Failed to fetch game state' });
    }
  });
  
  // Get round history
  app.get('/api/rounds', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const rounds = await storage.getRoundHistory(limit);
      
      res.json(rounds);
    } catch (error) {
      console.error('Error fetching round history:', error);
      res.status(500).json({ error: 'Failed to fetch round history' });
    }
  });
  
  // Get picks for a specific round
  app.get('/api/rounds/:id/picks', async (req, res) => {
    try {
      const roundId = parseInt(req.params.id);
      const picks = await storage.getPicksByRound(roundId);
      
      res.json(picks);
    } catch (error) {
      console.error('Error fetching round picks:', error);
      res.status(500).json({ error: 'Failed to fetch round picks' });
    }
  });

  // Get leaderboard
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      
      res.json(leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });

  // Theme API endpoints
  
  // Get current theme preference
  app.get('/api/theme', (req, res) => {
    try {
      const theme = getThemeFromCookie(req);
      res.json({ theme: theme || 'system' });
    } catch (error) {
      console.error('Error fetching theme preference:', error);
      res.status(500).json({ error: 'Failed to fetch theme preference' });
    }
  });
  
  // Set theme preference
  app.post('/api/theme', (req, res) => {
    try {
      const { theme } = req.body;
      
      if (!theme || !['dark', 'vibe', 'system'].includes(theme)) {
        return res.status(400).json({ error: 'Invalid theme value' });
      }
      
      if (theme === 'system') {
        // Clear the cookie if the theme is 'system'
        clearThemeCookie(res);
      } else {
        // Set the theme cookie
        setThemeCookie(res, theme);
      }
      
      res.json({ theme });
    } catch (error) {
      console.error('Error setting theme preference:', error);
      res.status(500).json({ error: 'Failed to set theme preference' });
    }
  });

  // Username API endpoints
  
  // Get current username
  app.get('/api/username', (req, res) => {
    try {
      const username = getUsernameFromCookie(req);
      res.json({ username: username || null });
    } catch (error) {
      console.error('Error fetching username:', error);
      res.status(500).json({ error: 'Failed to fetch username' });
    }
  });
  
  // Set username
  app.post('/api/username', (req, res) => {
    try {
      const { username } = req.body;
      
      if (!username) {
        return res.status(400).json({ error: 'Username is required' });
      }
      
      setUsernameCookie(res, username);
      
      res.json({ username });
    } catch (error) {
      console.error('Error setting username:', error);
      res.status(500).json({ error: 'Failed to set username' });
    }
  });
  
  // Clear username (logout)
  app.post('/api/logout', (req, res) => {
    try {
      clearUsernameCookie(res);
      res.json({ success: true });
    } catch (error) {
      console.error('Error logging out:', error);
      res.status(500).json({ error: 'Failed to logout' });
    }
  });

  return httpServer;
}
