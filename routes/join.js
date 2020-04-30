var express = require('express');
var gameServer = require('../server.js').gameServer;
var io = require('../server.js').io;



var router = express.Router(); 




router.get('/', function(req, res) {

  if(req.session.username){
    var correctRoute = gameServer.sendRoute(req.session.username);
    if(correctRoute == '/join' || correctRoute == '/'){
      res.render('join');
    } else {
		  res.redirect(correctRoute);
    }
  } else {
    res.render('login');
  }
});


router.post('/login', function(req, res) {
	

	var username = req.body.username;

	//si le joueur existe déjà
	if (gameServer.players[username]) {
		res.status(406).send({message: "Username " + username + " already exists"})
	}
	else {//sinon on l'ajoute au serveur en sauvegardant dans sa session

		req.session.username = username; 
		req.session.save();
		gameServer.newPlayer(username);

		res.send({redirect: '/join'});
	}
});

router.post('/game', function(req, res, callback) {


	var gameName = req.body.picked;

	var game = gameServer.games[gameName];

	var username = req.session.username;

	var player = gameServer.players[username];

	if (game.isAvailable()) {
		gameServer.joinMultiplayerGame(gameName, player);
		res.send({redirect: '/initialization'});
	} else {
		//isGameFull = true;
		res.send({redirect: '/join'});
	}
});

module.exports = router;