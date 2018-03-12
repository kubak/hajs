import React from 'react';
import { Client } from 'boardgame.io/react';
import TicTacToe from './Game';
import Board from './Board';
import './App.css';

const App = Client({
  game: TicTacToe,
  board: Board,
  debug: false,
  multiplayer: { server: 'localhost:8000' },
  numPlayers: 2
});

const Multiplayer = () => (
   <div className="runner">
      <div className="run">
         <App gameID="multi" playerID="0" />
      </div>
      <div className="run">
         <App gameID="multi" playerID="1" />
      </div>
  </div>
);

export default Multiplayer;
