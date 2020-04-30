var express = require('express');
var gameServer = require('../server.js').gameServer;
var io = require('../server.js').io;



var router = express.Router(); 


router.get('/', function(req, res) {

	var username = req.session.username;
  
  //quit le jeu
  if (gameServer.players[username].game) {
    let game = gameServer.players[username].game;
    
    io.sockets.clients(game.name).forEach(function(s){
        s.leave(game.name);
        if(!s.handshake.session.loggedin) {
          gameServer.removePlayer(s.handshake.session.username);
          s.disconnect();
        }
    });
    
    gameServer.removeGame(game.name);
    gameServer.updateAvailableGames();
  }
	res.redirect('/');
});

module.exports = router;