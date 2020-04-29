var express = require('express');
var gameServer = require('../server.js').gameServer;
var io = require('../server.js').io;



var router = express.Router(); 


//DECONNEXION A REVOIR !!!

router.get('/', function(req, res) {

	var username = req.session.username;
  
  //quit le jeu
  if (gameServer.players[username].game) {
    io.sockets.to(gameServer.players[username].game.name).emit('quit', {});

    gameServer.removeGame(gameServer.players[username].game.name);
    gameServer.updateAvailableGames();

  }
	if (!res.session.loggedin) {
		gameServer.removePlayer(username);
	  req.session.destroy();
	}

	res.redirect('/');
});

module.exports = router;