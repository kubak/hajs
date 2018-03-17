import React from 'react';
import { Card } from 'boardgame.io/ui';
import './Board.css';


class HajsCard extends React.Component {
   render () {
      return (<Card front={this.props.front} canHover={false} isFaceUp={true} />);
   }
};


class Board extends React.Component {

   takeCard (id) {
      if (this.props.ctx.phase !== 'take phase') {
         return;
      }
      // only one card per turn
      if (this.props.G.players[this.props.playerID].hand.length !== this.props.ctx.turn) {
         console.log(this.props.G.players[this.props.playerID].hand.length, '!==', this.props.ctx.turn + 1);
         return;
      }
      this.props.moves.takeCard(id);
   };

   playCard (id) {
      if (this.props.ctx.phase !== 'play phase') {
         return;
      }
      // only one card per turn
      if (this.props.G.players[this.props.playerID].table !== null) {
         return;
      }
      this.props.moves.playCard(id);
   };

   renderDeck() {
      const deck = this.props.G.players[this.props.playerID].deck;
      if (typeof deck === 'undefined') {
         return;
      }
      return (
         <li>
            Deck: {deck.map((tmp) => {
               return (
                  <div key={tmp.id} onClick={() => this.takeCard(tmp.id)}>
                     <HajsCard key={tmp.id} front={tmp.id} />
                  </div>
               );
            })}
         </li>
      );
   };

   renderHand() {
      const hand = this.props.G.players[this.props.playerID].hand;
      return (
         <li>
            Hand: {hand.map((tmp) => {
               return (
                  <div key={tmp.id} onClick={() => this.playCard(tmp.id)}>
                     <HajsCard key={tmp.id} front={tmp.id} />
                  </div>
               );
            })}
         </li>
      );
   };

   renderTable() {
      const table = this.props.G.players[this.props.playerID].table;
      if (table === null) {
         return;
      }
      return (
         <li>
            Table: <HajsCard front={table.id} />
         </li>
      );
   }

   renderDisplay() {
      const display = this.props.G.players[this.props.playerID].display;
      return (
         <li>
            Display: {display.map((tmp) => {
               return (<HajsCard key={tmp.id} front={tmp.id} />);
            })}
         </li>
      );
   }

  render () {
   if (typeof(this.props.G.players[this.props.playerID].hand) === 'undefined') {
     debugger;
   }
    let winner = '';
    if (typeof this.props.ctx.gameover !== 'undefined' && typeof this.props.ctx.gameover[this.props.playerID] !== 'undefined') {
      winner = <li>Winner !</li>;
    }
    const score = this.props.G.players[this.props.playerID].score;
    return (
      <div>
         <ul className="phases">
            {winner}
            <li style={{ background: '#aaa' }}>{this.props.ctx.phase}</li>
            <li>Score: {score}</li>
            {this.renderDeck()}
            {this.renderHand()}
            {this.renderTable()}
            {this.renderDisplay()}
         </ul>
      </div>
    );
  }
};

export default Board;

