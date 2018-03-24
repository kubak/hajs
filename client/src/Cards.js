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
   }, {
      id : 11,
      name: 'take card from stack',
      action: (G, ctx, playerID) => {
         const players = Object.assign({}, ...Object.keys(G.players).map(key => {
            if (key === playerID) {
               return {
                  [key]: {
                     ...G.players[key],
                     hand: [...G.players[key].hand, ...G.stack.slice(G.stack.length - 1)]
                  }
               };
            }
            return {[key]: { ...G.players[key] } };
         }));
         return {
            ...G,
            players,
            stack: G.stack.slice(0, G.stack.length - 1)
         };
      },
      order: 11
   }, {
        id: 12,
        name: 'loose chosen card',
        action: (G, ctx, playerID) => {
            const playerMoves = Object.assign({}, ...Object.keys(G.playerMoves).map(key => {
                if (key === playerID) {
                    return {
                        [key]: [ ...G.playerMoves[key], 'looseCard' ]
                    };
                }
                return { [key]: [ ...G.playerMoves[key] ] };
            }));
            return {
                ...G,
                playerMoves
            };
        },
       order: 12,
       stopping: true
   }, {
        id: 13,
        name: 'other players loose chosen card',
        action: (G, ctx, playerID) => {
            const playerMoves = Object.assign({}, ...Object.keys(G.playerMoves).map(key => {
                if (key !== playerID) {
                    return {
                        [key]: [ ...G.playerMoves[key], 'looseCard' ]
                    };
                }
                return { [key]: [ ...G.playerMoves[key] ] };
            }));
            return {
                ...G,
                playerMoves
            };
        },
        order: 13,
        stopping: true
   }
];

export default Cards;
