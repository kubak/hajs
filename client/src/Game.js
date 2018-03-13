/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Game } from 'boardgame.io/core';
//const Game = require('boardgame.io/core').Game;

const Cards = [1,2,3,4,5,6];

const Hajs = Game({
  name : 'Hajs',
  
  setup: (numPlayers) => {
    //const hands = new Array(numPlayers).fill([]);
    //const scores = new Array(numPlayers).fill(0);
    const players = {};
    for (let i = 0; i < numPlayers; i++) {
      players[i] = {
         hand : [],
         score : 0
      };
    }
    const ret = { 
      deck : Cards.slice(),
      players: players 
      //hand : hands,
      //score : scores
    };
    return ret;
  },
   /*
  playerView : (G, ctx, playerID) => {
    const ret = {
      ...G,
      hand : G.hand[Number(playerID)].slice(),
      score : 0 //G.score[Number(playerID)]
    };
    return ret;
  },
*/
  moves: {
    takeCard: (G, ctx) => { 
      // only allow taking one card per turn
      if (ctx.currentPlayer !== ctx.playerID) {
         return G;
      }

      // do not mutate G
      const card = G.deck[G.deck.length - 1];
      const players = Object.assign({}, ...Object.keys(G.players).map(key => {
         if (key === ctx.playerID) {
            return { 
               [key]: { 
                  ...G.players[key], 
                  hand: [...G.players[key].hand, card] 
               }
            }
         }
         return { [key] : { ...G.players[key] } };
      }));
      
      const ret = {
        ...G,
         players : players,
        deck: G.deck.slice(0, G.deck.length - 1)
      };
      return ret;
    },
    playCard: (G, ctx) => {
      // only allow playing one card per turn
      if (ctx.playerID !== ctx.currentPlayer) {
         return G;
      }

      // do not mutate G
      const card = G.players[ctx.playerID].hand[G.players[ctx.playerID].hand.length - 1];
      const players = Object.assign({}, ...Object.keys(G.players).map(key => {
         if (key === ctx.playerID) {
            return { 
               [key]: { 
                  ...G.players[key], 
                  score: G.players[key].score + card,
                  hand : G.players[key].hand.slice(0, G.players[key].hand.length - 1)
               }
            }
         }
         return { [key] : { ...G.players[key] } };
      }));
      const ret = {
         ...G,
         players: players
      };
      return ret;
    },
  },

  flow: {
    phases: [
      {
        name: 'take phase',
        endPhaseIf: (G, ctx) => {
           return G.deck.length === 0;
        },
        allowedMoves: ['takeCard'],
        onPhaseBegin: (G, ctx) => {
          // this fires once for every player... 
          return G;
        }, // stub
        onPhaseEnd: (G, ctx) => {
          return G;
        }, // stub
      },
      {
        name: 'play phase',
        allowedMoves: ['playCard'],
        endPhaseIf: (G) => {
         const handsLength = Object.keys(G.players).reduce((previous, current) => { 
            return previous += G.players[current].hand.length;
         }, 0);
         return handsLength === 0;
        },
        onPhaseBegin: (G, ctx) => G, // stub
        onPhaseEnd: (G, ctx) => G, // stub
      },
    ],
    endGameIf: (G) => {
      const handsLength = Object.keys(G.players).reduce((previous, current) => { 
         return previous += G.players[current].hand.length; 
      }, 0);
      if (handsLength === 0) {
         let winner = {};
         let maxScore = 0;
         Object.keys(G.players).forEach((key) => {
            if (G.players[key].score > maxScore) { // one winner
               maxScore = G.players[key].score;
               winner = { [key] : G.players[key].score };
            } else if (G.players[key].score === maxScore) { // draw
               winner.key = G.players[key].score;
            }
         });
         return winner;
      }
    },

    endTurnIf: (G, ctx) => {
      // end turn if all players taken/played one card
      if (ctx.phase === 'take phase') {
         console.log('take phase end turn', G.deck.length, '===', Cards.length - (ctx.turn + 1) * ctx.numPlayers);
         if (G.deck.length === Cards.length - (ctx.turn + 1) * ctx.numPlayers) {
            return true;
         }
      } else {
         const handsLength = Object.keys(G.players).reduce((previous, current) => { 
            return previous += G.players[current].hand.length;
         }, 0);
         console.log('play phase end turn', handsLength, '===', Cards.length - ((ctx.turn + 1) - Cards.length / ctx.numPlayers) * ctx.numPlayers);
         if (handsLength === Cards.length - ((ctx.turn + 1) - Cards.length / ctx.numPlayers) * ctx.numPlayers) {
            return true;
         }
      }
      return false;
      
      // turn, cards.length, handsLength
      // 0 4 2
      
      // 1 2 4 // number of cards in deck is cards.length - (turnNumber + 1) * numPlayers
      // 2 0 6 // number of cards in hands is (turnNumber + 1) * numPlayers
      
      // 3 0 4 // number of cards in hand is cards.length - (handsLength - cards.length / numPlayers) * numPlayers
      //4 0 4 //  handsLength === cards.length - ((turnNumber + 1) cards.length / numPlayers) * numPlayers
      // 4 0 2
      // 5 0 0
    }

  }
});

export default Hajs;

//module.exports = Hajs;
