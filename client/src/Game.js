import { Game, TurnOrder } from 'boardgame.io/core';

const Cards = [
   {
      id : 1,
      name: 'one',
      action : (G, ctx, playerID) => {
         const players = Object.assign({}, ...Object.keys(G.players).map(key => {
            if (key === playerID) {
               return {
                  [key]: {
                     ...G.players[key],
                     score: G.players[key].score + 1
                  }
               };
            }
            return {[key]: { ...G.players[key] } };
         }));
         return {
            ...G,
            players
         };
      },
      order: 1
   }, {
      id : 2,
      name: 'minus two',
      action : (G, ctx, playerID) => {
         const players = Object.assign({}, ...Object.keys(G.players).map(key => {
            if (key === playerID) {
               return {
                  [key]: {
                     ...G.players[key],
                     score: Math.max(G.players[key].score - 2, 0)
                  }
               };
            }
            return {[key]: { ...G.players[key] } };
         }));
         return {
            ...G,
            players
         };
      },
      order: 2
   }, {
      id : 3,
      name: 'three for everyone',
      action : (G, ctx, playerID) => {
         const players = Object.assign({}, ...Object.keys(G.players).map(key => {
            return {
               [key]: {
                  ...G.players[key],
                  score: G.players[key].score + 3
               }
            };
         }));
         return {
            ...G,
            players
         };
      },
      order: 3
   }, {
      id : 4,
      name: 'four',
      action : (G, ctx, playerID) => {
         const players = Object.assign({}, ...Object.keys(G.players).map(key => {
            if (key === playerID) {
               return {
                  [key]: {
                     ...G.players[key],
                     score: G.players[key].score + 4
                  }
               };
            }
            return {[key]: { ...G.players[key] } };
         }));
         return {
            ...G,
            players
         };
      },
      order: 4
   }, {
      id : 5,
      name: 'half',
      action : (G, ctx, playerID) => {
         const players = Object.assign({}, ...Object.keys(G.players).map(key => {
            if (key === playerID) {
               return {
                  [key]: {
                     ...G.players[key],
                     score: Math.ceil(G.players[key].score / 2)
                  }
               };
            }
            return {[key]: { ...G.players[key] } };
         }));
         return {
            ...G,
            players
         };
      },
      order: 5
   }, {
      id : 6,
      name: 'six',
      action : (G, ctx, playerID) => {
         const players = Object.assign({}, ...Object.keys(G.players).map(key => {
            if (key === playerID) {
               return {
                  [key]: {
                     ...G.players[key],
                     score: G.players[key].score + 6
                  }
               };
            }
            return {[key]: { ...G.players[key] } };
         }));
         return {
            ...G,
            players
         };
      },
      order: 6
   }, {
      id : 7,
      name: 'double',
      action : (G, ctx, playerID) => {
         const players = Object.assign({}, ...Object.keys(G.players).map(key => {
            if (key === playerID) {
               return {
                  [key]: {
                     ...G.players[key],
                     score: G.players[key].score * 2
                  }
               };
            }
            return {[key]: { ...G.players[key] } };
         }));
         return {
            ...G,
            players
         };
      },
      order: 7
   }, {
      id : 8,
      name: 'minus eight',
      action : (G, ctx, playerID) => {
         const players = Object.assign({}, ...Object.keys(G.players).map(key => {
            if (key === playerID) {
               return {
                  [key]: {
                     ...G.players[key],
                     score: Math.max(G.players[key].score - 8, 0)
                  }
               };
            }
            return {[key]: { ...G.players[key] } };
         }));
         return {
            ...G,
            players
         };
      },
      order: 8
   }, {
      id : 9,
      name: 'nine',
      action : (G, ctx, playerID) => {
         const players = Object.assign({}, ...Object.keys(G.players).map(key => {
            if (key === playerID) {
               return {
                  [key]: {
                     ...G.players[key],
                     score: G.players[key].score + 9
                  }
               };
            }
            return {[key]: { ...G.players[key] } };
         }));
         return {
            ...G,
            players
         };
      },
      order: 9
   }, {
      id : 10,
      name: 'ten',
      action : (G, ctx, playerID) => {
         const players = Object.assign({}, ...Object.keys(G.players).map(key => {
            if (key === playerID) {
               return {
                  [key]: {
                     ...G.players[key],
                     score: G.players[key].score + 10
                  }
               };
            }
            return {[key]: { ...G.players[key] } };
         }));
         return {
            ...G,
            players
         };
      },
      order: 10
   }
];

const TakeTurns = 2;
const TotalTurns = 5;

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
         table : null,
         cardPlayed: false,
         cardTaken: false
      };
      // divide deck between players
      players[i].deck = deck.slice(i * TotalTurns, i * TotalTurns + TotalTurns);
    }

    const ret = { 
      players: players 
    };
    return ret;
  },
  moves: {
    takeCard: (G, ctx, cardID) => {
      // only allow taking one card per turn
      if (G.players[ctx.playerID].cardTaken) {
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
            player.cardTaken = true;
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
         players
      };
      return ret;
    },
    playCard: (G, ctx, cardID) => {
       // need to take a card first
       if (!G.players[ctx.playerID].cardTaken) {
         return G;
       }
      // only allow playing one card per turn
      if (G.players[ctx.playerID].cardPlayed) {
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
                  table: card,
                  hand: [...playerHand.slice(0, cardIndex), ...playerHand.slice(cardIndex + 1)],
                  cardPlayed: true
               }
            }
         }
         return { [key] : { ...G.players[key] } };
      }));
      const Ret = {
         ...G,
         players
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
            // end after TakeTurns moves
            //return ctx.turn === 1; // will this work ?
            //this will work
            const HandsLength = Object.keys(G.players).reduce((previous, current) => {
               return previous + G.players[current].hand.length;
            }, 0);
            return HandsLength === ctx.numPlayers * TakeTurns;
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
            const CardsTaken = Object.keys(G.players).reduce((previous, current) => {
               return previous + (G.players[current].cardTaken ? 1 : 0);
            }, 0);
            //console.log('take phase end turn', CardsTaken, '===', ctx.numPlayers);
            if (CardsTaken === ctx.numPlayers) {
               return true;
            }
           return false;
         },
         onTurnEnd: (G, ctx) => {
            // move nextDeck to deck for all players
            // set cardPlayed to false
            const players = Object.assign({}, ...Object.keys(G.players).map(key => {
               const { nextDeck, ...player } = G.players[key];
               return {
                  [key]: {
                     ...player,
                     deck: [...G.players[key].nextDeck],
                     cardTaken: false
                  }
               };
            }));
            const Ret = {
               ...G,
               players
            };
            return Ret;
         }
      },
      {
        name: 'play phase',
        allowedMoves: ['takeCard', 'playCard'],
        turnOrder: TurnOrder.ANY,
         endPhaseIf: (G, ctx) => {
            return ctx.turn === TotalTurns;
         },
         onPhaseBegin: (G, ctx) => {
            return G;
         }, // stub
         onPhaseEnd: (G, ctx) => {
            return G;
         }, // stub
         endTurnIf: (G, ctx) => {
            // end turn if all players took one card and played one card
            const CardsTaken = Object.keys(G.players).reduce((previous, current) => {
               return previous + (G.players[current].cardTaken ? 1 : 0);
            }, 0);
            // all players placed a card on the table
            const CardsPlayed = Object.keys(G.players).reduce((previous, current) => {
               return previous + (G.players[current].cardPlayed ? 1 : 0);
            }, 0);
            //console.log('play phase end turn', CardsTaken, '===', ctx.numPlayers, '&&', CardsPlayed, '===', ctx.numPlayers);
            if (CardsTaken === ctx.numPlayers && CardsPlayed === ctx.numPlayers) {
               return true;
            }
            return false;
         },
         onTurnEnd: (G, ctx) => {
            // play all players cards in the order of order
            let players = Object.keys(G.players).map(key => {
               return {
                  ...G.players[key],
                  playerID: key
               };
            });
            players = players.sort((previous, current) => {
               if (previous.table.order < current.table.order) {
                  return -1;
               }
               return 1; // order property is unique to each card
            });
            let ret = { ...G };
            players.forEach(tmp => {
               // run cards action
               ret = ret.players[tmp.playerID].table.action(ret, ctx, tmp.playerID);
            });
            // move cards from table to display, move nextDeck to deck for all players, set cardTaken and cardPlayed to false
            players = Object.assign({}, ...Object.keys(ret.players).map(key => {
               let { nextDeck, ...player } = ret.players[key];

               return {
                  [key]: {
                     ...player,
                     display: [...player.display, player.table],
                     deck: [...ret.players[key].nextDeck],
                     table: null,
                     cardTaken: false,
                     cardPlayed: false
                  }
               };
            }));
            return { 
               ...ret,
               players
            };
         }
      },
    ],

    endGameIf: (G, ctx) => {
       if (ctx.phase !== 'play phase') {
         return;
       }
      const TablesLength = Object.keys(G.players).reduce((previous, current) => {
         if (G.players[current].table !== null) {
            return previous + 1;
         }
         return previous;
      }, 0);
      if (ctx.turn === TotalTurns && TablesLength === 0) {
         /*
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
         */
         // find winner
         let winner = {};
         let maxScore = 0;
         const players = G.players;
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
