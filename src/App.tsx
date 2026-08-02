/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HashRouter, Routes, Route } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { Leaderboard } from './pages/Leaderboard';

// Import games (to be created)
import { Game1 } from './games/game1/Game1';
import { Game2 } from './games/game2/Game2';
import { Game3 } from './games/game3/Game3';
import { Game4 } from './games/game4/Game4';
import { Game5 } from './games/game5/Game5';

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/game1" element={<Game1 />} />
          <Route path="/game2" element={<Game2 />} />
          <Route path="/game3" element={<Game3 />} />
          <Route path="/game4" element={<Game4 />} />
          <Route path="/game5" element={<Game5 />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
