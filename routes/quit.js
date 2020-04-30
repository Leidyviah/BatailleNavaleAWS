var express = require('express');
var gameServer = require('../server.js').gameServer;
var io = require('../server.js').io;



var router = express.Router(); 


router.get('/', function(req, res) {

	var username = req.session.username;
  
  //quit le jeu
  if (gameServer.players[username].game) {
    let game = gameServer.players[username].game;
    
    if(game.gameType == "multi"){
      if(game.player_one.username == username){
        io.sockets.sockets[game.player_two.socketId].leave(game.name);
        if(!io.sockets.sockets[game.player_two.socketId].handshake.session.loggedin){
          gameServer.removePlayer(game.player_two.username);
          io.sockets.sockets[game.player_two.socketId].disconnect();
        }
        io.sockets.sockets[game.player_two.socketId].
      } else {
        io.sockets.sockets[game.player_one.socketId].leave(game.name);
        if(!io.sockets.sockets[game.player_one.socketId].handshake.session.loggedin){
          gameServer.removePlayer(game.player_one.username);
          io.sockets.sockets[game.player_one.socketId].disconnect();
        }
        io.
      }
    }
    
    gameServer.removeGame(game.name);
    gameServer.updateAvailableGames();
  }
  if(!req.session.loggedin){
    gameServer.removePlayer(username);
    req.session.destroy();
  }
	res.redirect('/');
});

module.exports = router;