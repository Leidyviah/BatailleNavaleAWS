var express = require('express');
var gameServer = require('../server.js').gameServer;



var router = express.Router();



router.get('/', function(req, res) {
	var correctRoute = gameServer.sendRoute(req.session.username);
	if (correctRoute == '/') {
		

		if(!req.session.loggedin) {
      req.session.username = req.sessionID;
    }
		req.session.save();


	
		gameServer.newPlayer(req.session.username);//création d'un joueu(player) avec cet id

		gameServer.createSoloGame(gameServer.players[req.session.username]);//contre l'ia

		
		res.redirect('/setBoats');
	} else {
		res.redirect(correctRoute);
	}
});

module.exports = router;