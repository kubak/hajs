import { Game, TurnOrder } from 'boardgame.io/core';

const Cards = [
   { id : 1, score : 1 },
   { id : 2, score : 2 },
   { id : 3, score : 3 },
   { id : 4, score : 4 },
   { id : 5, score : 5 },
   { id : 6, score : 6 }
];

const CardsPerPlayer = 3;

const Hajs = Game({
  name : 'Hajs',
  
  setup: (ctx) => {
    const players = {};
    const deck = ctx.random.Shuffle(Cards); // shuffle cards
    // at least for now playerIDs are ints starting with 0 so a simple for loop will do
    for (let i = 0; i < ctx.numPlayers; i++) {
      players[i] = {
         hand : [],
         display : [],
         score : 0,
         table : []
      };
      // divide deck between players
      players[i].deck = deck.slice(i * CardsPerPlayer, i * CardsPerPlayer + CardsPerPlayer);
    }

    const ret = { 
      players: players 
    };
    return ret;
  },
  moves: {
    takeCard: (G, ctx, cardID) => {
      // only allow taking one card per turn
      if (G.players[ctx.playerID].hand.length !== ctx.turn) {
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
            player.hand = [...G.players[key].hand, card];
            return { [key]: player };
         } else if (key === (+ctx.playerID + 1) % ctx.numPlayers + '') {
            // pass deck to the next player
            return {
               [key]: {
                  ...G.players[key],
                  nextDeck: [...playerDeck.slice(0, cardIndex), ...playerDeck.slice(cardIndex + 1)]
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
    playCard: (G, ctx, cardID) => {
      // only allow playing one card per turn
      if (G.players[ctx.playerID].table.length > 0) {
         return G;
      }

      // do not mutate G
      const playerHand = G.players[ctx.playerID].hand;
      const cardIndex = playerHand.findIndex(tmp => tmp.id === cardID);
      const card = { ...playerHand[cardIndex] };
      const players = Object.assign({}, ...Object.keys(G.players).map(key => {
         if (key === ctx.playerID) {
            return { 
               [key]: { 
                  ...G.players[key], 
                  //score: G.players[key].score + card.score,
                  table: [card],
                  hand: [...playerHand.slice(0, cardIndex), ...playerHand.slice(cardIndex + 1)]
               }
            }
         }
         return { [key] : { ...G.players[key] } };
      }));
      const Ret = {
         ...G,
         players: players
      };
      return Ret;
    },
  },

  flow: {
    phases: [
      {
        name: 'take phase',
        allowedMoves: ['takeCard'],
        turnOrder: TurnOrder.ANY,
        endPhaseIf: (G, ctx) => {
           const deck = G.players[Object.keys(G.players).find(key => typeof G.players[key].deck !== 'undefined')].deck;
           return deck.length === 0;
        },
        onPhaseBegin: (G, ctx) => {
          // this fires once for every player... 
          return G;
        }, // stub
        onPhaseEnd: (G, ctx) => {
          return G;
        }, // stub
         endTurnIf: (G, ctx) => {
            // end turn if all players took one card
            const HandsLength = Object.keys(G.players).reduce((previous, current) => {
               return previous + G.players[current].hand.length;
            }, 0);
            //console.log('take phase end turn', HandsLength, '===', (ctx.turn + 1) * ctx.numPlayers);
            if (HandsLength === (ctx.turn + 1) * ctx.numPlayers) {
               return true;
            }
           return false;
         },
         onTurnEnd: (G, ctx) => {
            // move nextDeck to deck for all players
            const players = Object.assign({}, ...Object.keys(G.players).map(key => {
               const { nextDeck, ...player } = G.players[key];
               player.deck =  [...G.players[key].nextDeck];
               return { [key]: player };
            }));
            const Ret = {
               ...G,
               players: players
            };
            return Ret;
         }
      },
      {
        name: 'play phase',
        allowedMoves: ['playCard'],
        turnOrder: TurnOrder.ANY,
        endPhaseIf: (G) => {
         const handsLength = Object.keys(G.players).reduce((previous, current) => {
            return previous + G.players[current].hand.length;
         }, 0);
         return handsLength === 0;
        },
        onPhaseBegin: (G, ctx) => G, // stub
        onPhaseEnd: (G, ctx) => G, // stub
         endTurnIf: (G, ctx) => {
            // all players placed a card on the table
            const TableLength = Object.keys(G.players).reduce((previous, current) => {
               if (G.players[current].table.length > 0) {
                  return previous + 1;
               }
               return previous;
            }, 0);
            //console.log('play phase end turn', TableLength, '===', ctx.numPlayers);
            if (TableLength === ctx.numPlayers) {
               return true;
            }
            return false;
         },
         onTurnEnd: (G, ctx) => {
            // play all players cards
            const players = Object.keys(G.players).map(key => {
               const player = G.players[key];
               return {
                  ...player,
                  display: [...player.display].concat(player.table),
                  table: []
               };
            });
            return { 
               ...G,
               players
            };
         }
      },
    ],

    endGameIf: (G, ctx) => {
       if (ctx.phase !== 'play phase') {
         return;
       }
      const handsLength = Object.keys(G.players).reduce((previous, current) => { 
         return previous + G.players[current].hand.length;
      }, 0);
      const TablesLength = Object.keys(G.players).reduce((previous, current) => {
         if (G.players[current].table.length > 0) {
            return previous + 1;
         }
         return previous;
      }, 0);
      if (handsLength === 0 && TablesLength === 0) {
         // add scores for all cards on player's display
         const players = Object.assign({}, ...Object.keys(G.players).map((key) => {
            const score = G.players[key].display.reduce((previous, current) => {
               return previous + current.score;
            }, 0);
            return {
               [key] : {
                  ...G.players[key],
                  score: score,
                  display: []
               }
            };
         }));
         // find winner
         let winner = {};
         let maxScore = 0;
         Object.keys(players).forEach((key) => {
            if (players[key].score > maxScore) { // one winner
               maxScore = players[key].score;
               winner = { [key] : players[key].score };
            } else if (players[key].score === maxScore) { // draw
               winner.key = players[key].score;
            }
         });
         return winner;
      }
    }
  }
});

export default Hajs;
