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
        if(io.sockets.sockets[game.player_two.socketId].disconnect();
      }
    }
    io.sockets.sockets[socketId].leave
    
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