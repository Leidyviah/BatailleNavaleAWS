
var express = require('express');
var gameServer = require('../server.js').gameServer;
var io = require('../server.js').io;


var router = express.Router(); 


router.get('/', function(req, res) {
	var correctRoute = gameServer.sendRoute(req.session.username);
	if (correctRoute == '/') {
	 	res.render('createGame', {loggedIn: req.session.loggedin});
	 }
	 else {
	 	res.redirect(correctRoute);
	 }
});


router.post('/', function(req, res) {

  var username;
	if(req.session.loggedin) {
    username = req.session.username
  } else {
    username = req.body.username;
    if (gameServer.usernameAlreadyExists(username)) {
      res.status(406).send({message: "Username " + username + " exists"});
    }
  }
  
	var gameName = req.body.gameName;

	if (gameServer.gameNameAlreadyExists(gameName)) {
		res.status(406).send({message: "Game name " + gameName + " exists"});
	}
	else { 

		req.session.username = username; 

		req.session.save();


		gameServer.newPlayer(username);

		gameServer.createMultiplayerGame(gameName, gameServer.players[username]);



		io.emit('listGames', gameServer.availableGames);

		res.send({redirect: '/initialization'}); //redirection
	}
});


module.exports = router;