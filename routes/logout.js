var express = require('express');
var gameServer = require('../server.js').gameServer;
var io = require('../server.js').io;



var router = express.Router(); 


router.get('/', function(req, res) {

	var username = req.session.username;

	if (username) {

		if (gameServer.players[username].game) {

			io.sockets.to(gameServer.players[username].game.name).emit('quit', {});

			gameServer.removeGame(gameServer.players[username].game.name);
			gameServer.updateAvailableGames();

		}
		gameServer.removePlayer(username);
	}

	//req.session.destroy();

	res.redirect('/');
});

module.exports = router;