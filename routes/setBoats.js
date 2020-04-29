var express = require('express');
var gameServer = require('../server.js').gameServer;
var io = require('../server.js').io;
var router = express.Router(); 




router.get('/:id', function(req, res) {
	var correctRoute = gameServer.sendRoute(req.session.username, req.params.id);
	if (correctRoute == '/setBoats/' + req.params.id) {
	 	res.render('setBoats', {id: req.params.id});
	 }
	 else {
	 	res.redirect(correctRoute);
	 }
});


router.get('/:id/getBoats', function(req, res) {

	if (req.session.username) {
		var username = req.session.username;

		if (gameServer.games[req.params.id]) {
			if (!gameServer.games[req.params.id].isAvailable()) {

				var battleship = gameServer.players[username].runningGames[req.params.id]["battleship"];
				res.send({battleship: battleship});

			}
		}
	}
	else {

		res.status(400).send({errors: 'Error'});
	}
});


router.post('/:id/sendBoats', function(req, res) {

	var username = req.session.username;
	var battleship = gameServer.players[username].runningGames[req.params.id]["battleship"];

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
			redirect:'/game/' + req.params.id,
		});
	}
});



module.exports = router;
