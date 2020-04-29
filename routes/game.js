var express = require('express');
var gameServer = require('../server.js').gameServer;
var io = require('../server.js').io;


var router = express.Router();



router.get('/:id', function(req, res) {
	var correctRoute = gameServer.sendRoute(req.session.username, req.params.id);
	if (correctRoute == '/game/' + req.params.id) {
	 	res.render('game', {id: req.params.id});
	 }
	 else {
	 	res.redirect(correctRoute);
	 }
});



//donner au client sa grille
router.get('/:id/getBattleship', function(req, res) {

	if (req.session.username) {  

		var username = req.session.username;

		if (gameServer.players[username].runningGames[req.params.id]["game"]) {
			if (!gameServer.players[username].runningGames[req.params.id]["game"].isAvailable()) {

				var battleship = gameServer.players[username].runningGames[req.params.id]["battleship"];
				res.send({battleship: battleship})

			}
		}
	}
	else {
		res.status(400).send({errors: 'You\'re not connected'});
	}
});

router.use(function(req, res, next) {
	res.redirect(gameServer.sendRoute(req.session.username, null))
});

module.exports = router;
