import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Routes, Route} from "react-router"

import {LandingPage} from "./landingpage/LandingPage.tsx"
import {Game} from "./game/Game.tsx"

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/game/:id" element={<Game />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);