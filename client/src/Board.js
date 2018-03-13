/*
 * Copyright 2017 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React from 'react';
import './Board.css';


class Board extends React.Component {

  takeCard = () => {
    if (this.props.ctx.phase !== 'take phase') {
      return;
    }
      // only one card per turn
      if (this.props.playerID !== this.props.ctx.currentPlayer) {
         return;
      }
    this.props.moves.takeCard();
    this.props.events.endTurn();
  };

  playCard = () => {
    if (this.props.ctx.phase !== 'play phase') {
      return;
    }
      // only one card per turn
      if (this.props.playerID !== this.props.ctx.currentPlayer) {
         return;
      }
    this.props.moves.playCard();
    this.props.events.endTurn();
  };

  render() {
   if (typeof(this.props.G.players[this.props.playerID].hand) === 'undefined') {
     debugger;
   }
    let winner = '';
    if (typeof this.props.ctx.gameover !== 'undefined' && typeof this.props.ctx.gameover[this.props.playerID] !== 'undefined') {
      winner = <li>Winner !</li>;
    }
    return (
      <div>
         <ul className="phases">
            {winner}
            <li style={{ background: '#aaa' }}>{this.props.ctx.phase}</li>
            <li>Deck: {this.props.G.deck.length}</li>
            <li>Hand: {this.props.G.players[this.props.playerID].hand.length}</li>
            <li>
               <button id="take" onClick={this.takeCard} disabled={!this.props.isActive}>
                  Take Card
               </button>
            </li>
            <li>
               <button id="play" onClick={this.playCard} disabled={!this.props.isActive}>
                  Play Card
               </button>
            </li>
         </ul>
      </div>
    );
  }
};

export default Board;

