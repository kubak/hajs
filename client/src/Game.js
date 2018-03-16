import { Game, TurnOrder } from 'boardgame.io/core';

const Cards = [
   { id : 1, score : 1 },
   { id : 2, score : 2 },
   { id : 3, score : 3 },
   { id : 4, score : 4 },
   { id : 5, score : 5 },
   { id : 6, score : 6 }
];

const Hajs = Game({
  name : 'Hajs',
  
  setup: (numPlayers) => {
    const players = {};
    // at least for now playerIDs are ints starting with 0 so a simple for loop will do
    for (let i = 0; i < numPlayers; i++) {
      players[i] = {
         hand : [],
         score : 0,
         table : null
      };
      // give deck to the first player
      // @todo do this with currentPlayer ?
      if (i === 0) {
         players[i].deck = Cards.slice();
      }
    }

    const ret = { 
      players: players 
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
    takeCard: (G, ctx, cardID) => {
      // only allow taking one card per turn
      if (ctx.currentPlayer !== ctx.playerID) {
         return G;
      }

      // do not mutate G
      const playerDeck = G.players[ctx.playerID].deck;
      const cardIndex = playerDeck.findIndex(tmp => tmp.id === cardID);
      const card = playerDeck[cardIndex];
      const players = Object.assign({}, ...Object.keys(G.players).map(key => {
         if (key === ctx.playerID) {
            // remove deck
            // https://codeburst.io/use-es2015-object-rest-operator-to-omit-properties-38a3ecffe90
            const { deck, ...player } = G.players[key];
            player.hand =  [...G.players[key].hand, card]
            return { [key]: player };
         } else if (key === TurnOrder.DEFAULT.next(G, ctx)) {
            // pass deck to the next player
            return {
               [key]: {
                  ...G.players[key],
                  deck: [...playerDeck.slice(0, cardIndex), ...playerDeck.slice(cardIndex + 1)]
               }
            };
         }
         return { [key] : { ...G.players[key] } };
      }));

      const ret = {
        ...G,
         players : players
      };
      return ret;
    },
    playCard: (G, ctx) => {
      // only allow playing one card per turn
      if (G.players[ctx.playerID].table !== null) {
         return G;
      }

      // do not mutate G
      const card = { ...G.players[ctx.playerID].hand[G.players[ctx.playerID].hand.length - 1] };
      const players = Object.assign({}, ...Object.keys(G.players).map(key => {
         if (key === ctx.playerID) {
            return { 
               [key]: { 
                  ...G.players[key], 
                  //score: G.players[key].score + card.score,
                  table: card,
                  hand: G.players[key].hand.slice(0, G.players[key].hand.length - 1)
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
           const deck = G.players[Object.keys(G.players).find(key => typeof G.players[key].deck !== 'undefined')].deck;
           return deck.length === 0;
        },
        allowedMoves: ['takeCard'],
        onPhaseBegin: (G, ctx) => {
          // this fires once for every player... 
          return G;
        }, // stub
        onPhaseEnd: (G, ctx) => {
          return G;
        }, // stub
        endTurnIf: () => true, // end turn after every move
      },
      {
        name: 'play phase',
        allowedMoves: ['playCard'],
        turnOrder: TurnOrder.ANY,
        endPhaseIf: (G) => {
         const handsLength = Object.keys(G.players).reduce((previous, current) => {
            return previous += G.players[current].hand.length;
         }, 0);
         return handsLength === 0;
        },
        onPhaseBegin: (G, ctx) => G, // stub
        onPhaseEnd: (G, ctx) => G, // stub
         endTurnIf: (G, ctx) => {
            const handsLength = Object.keys(G.players).reduce((previous, current) => { 
               return previous += G.players[current].hand.length;
            }, 0);
            //console.log('play phase end turn',  ((ctx.turn + 1) - Cards.length) * ctx.numPlayers, '===', Cards.length - handsLength);
            if (((ctx.turn + 1) - Cards.length) * ctx.numPlayers === Cards.length - handsLength) {
               return true;
            }
            return false;
         },
         onTurnEnd: (G, ctx) => {
            // play all players cards
            const players = Object.keys(G.players).map(key => {
               const player = G.players[key];
               // onTurnEnd also runs on beginning of the phase...
               if (player.table === null) {
                  return player;
               }
               return {
                  ...player,
                  score: player.score + player.table.score,
                  table: null
               };
            });
            return { 
               ...G,
               players
            };
         }
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
/*
    endTurnIf: (G, ctx) => {
       // this is not used right now as endTurn is called in Board
      // end turn if all players taken/played one card
      const deck = G.players[ Object.keys(G.players).find(key => typeof G.players[key].deck !== 'undefined') ].deck;
      if (ctx.phase === 'take phase') {
         console.log('take phase end turn', deck.length, '===', Cards.length - (ctx.turn + 1) * ctx.numPlayers);
         if (deck.length === Cards.length - (ctx.turn + 1) * ctx.numPlayers) {
            return true;
         }
      } else {
         // this is used
         const handsLength = Object.keys(G.players).reduce((previous, current) => { 
            return previous += G.players[current].hand.length;
         }, 0);
         console.log('play phase end turn',  ((ctx.turn + 1) - Cards.length) * ctx.numPlayers, '===', Cards.length - handsLength);
         if (((ctx.turn + 1) - Cards.length) * ctx.numPlayers === Cards.length - handsLength) {
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
      
      // 6 (7) 6 5   ((turnNumer + 1) - cardsLength) * numPlayers === (cardsLength - handsLength)  
      // 6 (7) 6 4   
    }
*/
  }
});

export default Hajs;
