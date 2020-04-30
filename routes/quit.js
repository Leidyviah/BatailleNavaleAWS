var express = require('express');
var gameServer = require('../server.js').gameServer;
var io = require('../server.js').io;



var router = express.Router(); 


//DECONNEXION A REVOIR !!!

router.get('/', function(req, res) {

	var username = req.session.username;
  
  //quit le jeu
  if (gameServer.players[username].game) {
    let game = gameServer.players[username].game;
    
    gameServer.removeGame(gameServer.players[username].game.name);
    gameServer.updateAvailableGames();
    
    let enemy;
    if(game.player_one.username == req.session.username){
      enemy = game.player_two.socketId;
    } else {
      enemy = game.player_one.socketId;
    }
    io.sockets.to(enemy).emit('quit');

  }
	if (!req.session.loggedin){
    gameServer.removePlayer(username);
    req.session.destroy();
	}

	res.redirect('/');
});

module.exports = router;