import { Game, TurnOrder } from 'boardgame.io/core';
import Cards from './Cards';

const TakeTurns = 2;
const TotalTurns = 5;

const Hajs = Game({
  name : 'Hajs',
  seed: 1,
  setup: (ctx) => {
    console.log('setup');
    const players = {};
    const deck = ctx.random.Shuffle(Cards); // shuffle cards
    const playerMoves = {};
    const nextRound = {
      playerMoves: {}
    };
    // at least for now playerIDs are ints starting with 0 so a simple for loop will do
    for (let i = 0; i < ctx.numPlayers; i++) {
      players[i] = {
        hand : [],
        display : [],
        score : 0,
        table : null,
        cardPlayed: false,
        cardTaken: false,
        turnsPlayed: 0
      };
      // divide deck between players
      players[i].deck = deck.slice(i * TotalTurns, i * TotalTurns + TotalTurns);
      // create playerMoves array
      playerMoves[i] = [];
      nextRound.playerMoves[i] = [];
    }

    const ret = {
      players,
      playerMoves,
      nextRound,
      stack: deck.slice(TotalTurns * ctx.numPlayers)
    };
    return ret;
  },
  moves: {
    takeCard: (G, ctx, cardID) => {
      console.log('take card player ' + ctx.playerID);
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
          return {
            [key]: {
              ...player,
              hand: [...G.players[key].hand, card],
              cardTaken: true,
              deck: []
            }
          };
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
      console.log('play card player ' + ctx.playerID);
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
          };
        }
        return { [key] : { ...G.players[key] } };
      }));
      const Ret = {
        ...G,
        players
      };
      return Ret;
    },
    looseCard: (G, ctx, cardID) => {
      console.log('loose card player ' + ctx.playerID);
      const index = G.playerMoves[ctx.playerID].indexOf('looseCard');
      if (index === -1) {
        return G;
      }
      const playerMoves = Object.assign({}, ...Object.keys(G.playerMoves).map(key => {
        if (key === ctx.playerID) {
          return {
            [key]: [...G.playerMoves[key].slice(0, index), ...G.playerMoves[key].slice(index + 1)]
          };
        }
        return { [key]: [ ...G.playerMoves[key] ] };
      }));
      const players = Object.assign({}, ...Object.keys(G.players).map(key => {
        if (key === ctx.playerID) {
          const cardIndex = G.players[key].hand.findIndex(tmp => tmp.id === cardID);
          return {
            [key]: {
              ...G.players[key],
              hand: [...G.players[key].hand.slice(0, cardIndex), ...G.players[key].hand.slice(cardIndex + 1)]
            }
          };
        }
        return { [key]: { ...G.players[key] } };
      }));
      return {
        ...G,
        playerMoves,
        players
      };
    }
  },

  flow: {
    phases: [
      {
        name: 'take phase',
        allowedMoves: ['takeCard'],
        turnOrder: TurnOrder.ANY,
         endPhaseIf: (G, ctx) => {
            const HandsLength = Object.keys(G.players).reduce((previous, current) => {
               return previous + G.players[current].hand.length;
            }, 0);
            const ret = HandsLength === ctx.numPlayers * TakeTurns;
            console.log('take phase endPhaseIf ' + ret);
            if (ret) {
              return 'play phase';
            }
            return false;
         },
        onPhaseBegin: (G, ctx) => {
          console.log('take phase onPhaseBegin');
          return G;
        }, // stub
        onPhaseEnd: (G, ctx) => {
          console.log('take phase onPhaseEnd');
          return G;
        }, // stub
         endTurnIf: (G, ctx) => {
            // end turn if all players took one card
            const CardsTaken = Object.keys(G.players).reduce((previous, current) => {
               return previous + (G.players[current].cardTaken ? 1 : 0);
            }, 0);
            //console.log('take phase end turn', CardsTaken, '===', ctx.numPlayers);
            console.log('take phase endTurnIf ' + (CardsTaken === ctx.numPlayers));
            if (CardsTaken === ctx.numPlayers) {
               return true;
            }
           return false;
         },
         onTurnEnd: (G, ctx) => {
           console.log('take phase onTurnEnd');
            // move nextDeck to deck for all players
            // set cardTaken to false
            // increment turnsPlayed
            const players = Object.assign({}, ...Object.keys(G.players).map(key => {
               const { nextDeck, ...player } = G.players[key];
               return {
                  [key]: {
                     ...player,
                     deck: [...G.players[key].nextDeck],
                     cardTaken: false,
                     turnsPlayed: G.players[key].turnsPlayed + 1
                  }
               };
            }));
            const Ret = {
               ...G,
               players
            };
            return Ret;
         }
      }, {
        name: 'play phase',
        allowedMoves: ['takeCard', 'playCard'],
        turnOrder: TurnOrder.ANY,
        endPhaseIf: (G, ctx) => {
          if (G.turnEnd) {
            return 'action phase';
          }
          return false;
        },
        onPhaseBegin: (G, ctx) => {
          console.log('play phase onPhaseBegin');
          return G;
        },
        onPhaseEnd: (G, ctx) => {
          console.log('play phase onPhaseEnd');
          // remove turnEnd property
          const { turnEnd, ...ret } = G;
          return ret;
        },
        onTurnBegin: (G, ctx) => {
          console.log('play phase onTurnBegin');
          return G;
        },
        endTurnIf: (G, ctx) => {
          // end turn if turnsPlayed is not equal for all players
          const turnsPlayed = Object.keys(G.players).map(key => G.players[key].turnsPlayed);
          if (Math.min(...turnsPlayed) !== Math.max(...turnsPlayed)) {
            console.log('play phase endTurnIf (turnsPlayed) true');
            return true;
          }
          console.log('play phase endTurnIf (turnsPlayed) false');

          // end turn if all players took one card and played one card
          const CardsTaken = Object.keys(G.players).reduce((previous, current) => {
             return previous + (G.players[current].cardTaken ? 1 : 0);
          }, 0);
          // all players placed a card on the table
          const CardsPlayed = Object.keys(G.players).reduce((previous, current) => {
             return previous + (G.players[current].cardPlayed ? 1 : 0);
          }, 0);
          //console.log('play phase end turn', CardsTaken, '===', ctx.numPlayers, '&&', CardsPlayed, '===', ctx.numPlayers);
          const ret = CardsTaken === ctx.numPlayers && CardsPlayed === ctx.numPlayers;
          console.log('play phase endTurnIf ' + ret);
          if (CardsTaken === ctx.numPlayers && CardsPlayed === ctx.numPlayers) {
             return true;
          }
          return false;
        },
        onTurnEnd: (G, ctx) => {
          let ret = { ...G };
          console.log('play phase onTurnEnd');
          // play all players cards in the order of order
          let players = Object.keys(
            G.players
          ).map(key => ({
            ...G.players[key],
            playerID: key
          })).filter(tmp => (
            tmp.table !== null
          )).sort((previous, current) => {
            if (previous.table.order < current.table.order) {
              return -1;
            }
            return 1; // order property is unique to each card
          });

          players.some(tmp => {
            if (G.players[tmp.playerID].played) {
              return false;
            }
            console.log('running ' + ret.players[tmp.playerID].table.name + ' for player ' + tmp.playerID);
            // run cards action
            ret = ret.players[tmp.playerID].table.action(ret, ctx, tmp.playerID);

            ret.players[tmp.playerID] = {
              ...ret.players[tmp.playerID],
              played: true
            };

            return ret.players[tmp.playerID].table.stopping;
          });
          // move cards from table to display, move nextDeck to deck for all players, set cardTaken and cardPlayed to false
          players = Object.assign({}, ...Object.keys(ret.players).map(key => {
            if (ret.players[key].played) {
              let { nextDeck, ...player } = ret.players[key];
              return {
                [key]: {
                  ...player,
                  display: [...player.display, player.table],
                  deck: [...ret.players[key].nextDeck],
                  table: null,
                  cardTaken: false,
                  cardPlayed: false,
                  turnsPlayed: ret.players[key].turnsPlayed + 1,
                  played: false
                }
              };
            }
            return { [key]: { ...ret.players[key] } };
          }));
          return {
            ...ret,
            players,
            turnEnd: true
          };
        }
      }, {
        name: 'action phase',
        allowedMoves: ['looseCard'],
        turnOrder: TurnOrder.ANY,
        endPhaseIf: (G, ctx) => {
          const playerMovesLength = Object.keys(G.playerMoves).reduce((previous, current) => {
            return previous + G.playerMoves[current].length;
          }, 0);
          const ret = playerMovesLength === 0;
          console.log('action phase endPhaseIf ' + ret);
          if (ret) {
            return 'play phase';
          }
          return false;
        },
        endTurnIf: (G, ctx) => {
          const playerMovesLength = Object.keys(G.playerMoves).reduce((previous, current) => {
            return previous + G.playerMoves[current].length;
          }, 0);
          const ret = playerMovesLength === 0;
          console.log('action phase endTurnIf ' + ret);
          return ret;
        },
        onPhaseBegin: (G, ctx) => {
          console.log('action phase onPhaseBegin');
          return G;
        },
        onPhaseEnd: (G, ctx) => {
          console.log('action phase onPhaseEnd');
          const playerMoves = Object.assign({}, ...Object.keys(G.players).map(key => {
            if (G.players[key].table === null) {
              return { [key]: G.nextRound.playerMoves[key] };
            }
            return { [key]: G.playerMoves[key] };
          }));
          const nextRoundPlayerMoves = Object.assign({}, ...Object.keys(G.players).map(key => {
            if (G.players[key].table === null) {
              return { [key]: [] };
            }
            return { [key]: G.nextRound.playerMoves[key] };
          }));
          return {
            ...G,
            playerMoves,
            nextRound: {
              playerMoves: nextRoundPlayerMoves
            }
          };
        },
        onTurnEnd: (G, ctx) => {
          console.log('action phase onTurnEnd');
          return G;
        }
      }
    ],

    endGameIf: (G, ctx) => {
      if (ctx.phase !== 'play phase') {
        return;
      }
      const turnsPlayed = Object.keys(G.players).reduce((previous, current) => {
        return previous + G.players[current].turnsPlayed;
      }, 0);
      const endGame = turnsPlayed / ctx.numPlayers === TotalTurns;
      console.log('end game if ' + endGame);
      if (turnsPlayed / ctx.numPlayers !== TotalTurns) {
        return;
      }
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
});

export default Hajs;
