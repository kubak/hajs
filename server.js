const KoaStatic = require('koa-static');
const Server = require('boardgame.io/server').Server;
const Hajs = require('./client/src/Game.js');

const server = Server({ games: [Hajs] });
server.app.use(KoaStatic('./client/build/'));
server.run(8000, () => {
   console.log('listening on port 8000');
});
