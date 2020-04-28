var express = require('express');
var gameServer = require('../server.js').gameServer;



var router = express.Router();



router.get('/', function(req, res) {
	var correctRoute = gameServer.sendRoute(req.session.username);
	if (correctRoute == '/') {
		

		req.session.username = req.sessionID;
		req.session.save();

		var UserID = req.sessionID;//attribution d'un ID


	
		gameServer.newPlayer(UserID);//création d'un joueu(player) avec cet id


		gameServer.createSoloGame(gameServer.players[UserID]);//contre l'ia

		
		res.redirect('/setBoats');
	} else {
		res.redirect(correctRoute);
	}
});

module.exports = router;