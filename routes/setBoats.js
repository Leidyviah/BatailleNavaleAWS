var express = require('express');
var gameServer = require('../server.js').gameServer;
var io = require('../server.js').io;
var router = express.Router(); 




router.get('/', function(req, res) {
	var correctRoute = gameServer.sendRoute(req.session.username);
	if (correctRoute == '/setBoats') {
	 	res.render('setBoats');
	 }
	 else {
	 	res.redirect(correctRoute);
	 }
});


router.get('/getBoats', function(req, res) {


	if (req.session.username) {
		var username = req.session.username;

		if (gameServer.players[username].game) {
			if (!gameServer.players[username].game.isAvailable()) {

				var battleship = gameServer.players[username].battleship;
				res.send({battleship: battleship});

			}
		}
	}
	else {

		res.status(400).send({errors: 'Error'});
	}
});


router.post('/sendBoats', function(req, res) {

	var username = req.session.username;
	var battleship = gameServer.players[username].battleship;

	var errors = [];


	if (req.body.randomSet) {//si le joueur veut que ses bateaux soient posés aléatoirement
		battleship.randomSetBoats();
	}
	else {

		var sentBoats = req.body.boats;
		var boats = battleship.boats;

	
		for (sentBoat in sentBoats) {
			sentBoats[sentBoat].coordinates = sentBoats[sentBoat].coordinates.map(Number);//faire un parse from sring to entier

			boats[sentBoat].setPosition(sentBoats[sentBoat].coordinates, sentBoats[sentBoat].direction);


			boats[sentBoat].setCoordinatesList();

			var error = battleship.positionIsNotValid(sentBoat);


			if (error) {
				errors.push(error);
			}


			else {
				battleship.setBoat(sentBoat);
			}
		}
	}

	if (errors.length != 0) {//il y a des erreurs
		res.status(400).send({errors: errors});
	}

	
	else {//commencer la partie
		battleship.areBoatsSet = true;
		res.send({
			redirect:'/game',
		});
	}
});



module.exports = router;
