import React from 'react';
import { Card } from 'boardgame.io/ui';
import './Board.css';


class HajsCard extends React.Component {
   render () {
      return (<Card front={this.props.front} canHover={false} isFaceUp={true} />);
   }
};


class Board extends React.Component {

  takeCard = (id) => {
    if (this.props.ctx.phase !== 'take phase') {
      return;
    }
      // only one card per turn
      if (this.props.playerID !== this.props.ctx.currentPlayer) {
         return;
      }
    this.props.moves.takeCard(id);
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
               return (<HajsCard key={tmp.id} front={tmp.id} />);
            })}
         </li>
      );
   };

  render () {
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
            {this.renderDeck()}
            {this.renderHand()}
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

