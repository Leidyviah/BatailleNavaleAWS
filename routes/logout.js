var express = require('express');
var gameServer = require('../server.js').gameServer;
var io = require('../server.js').io;



var router = express.Router(); 


//DECONNEXION A REVOIR !!!

router.get('/', function(req, res) {

	var username = req.session.username;

	if (username) {

		if (gameServer.players[username].runningGames) {

			for(game of gameServer.players[username].runningGames) {
				io.sockets.to(game.name).emit('logout', {});
				gameServer.removeGame(game);
				gameServer.updateAvailableGames();
			}
			


		}
		gameServer.removePlayer(username);
	}

	req.session.destroy();
	res.redirect('/');
});

module.exports = router;