var express = require('express');
var gameServer = require('../server.js').gameServer;
var io = require('../server.js').io;


var router = express.Router();



router.get('/', function(req, res) {
	var correctRoute = gameServer.sendRoute(req.session.username);
	if (correctRoute == '/game') {
	 	res.render('game');
	 }
	 else {
	 	res.redirect(correctRoute);
	 }
});



//donner au client sa grille
router.get('/getBattleship', function(req, res) {

	if (req.session.username) {  

		var username = req.session.username;

		if (gameServer.players[username].game) {
			if (!gameServer.players[username].game.isAvailable()) {

				var battleship = gameServer.players[username].battleship;
				res.send({battleship: battleship})

			}
		}
	}
	else {
		res.status(400).send({errors: 'You\'re not connected'});
	}
});

module.exports = router;
