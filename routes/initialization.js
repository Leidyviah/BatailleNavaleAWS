var express = require('express');
var gameServer = require('../server.js').gameServer;
var io = require('../server.js').io;


var router = express.Router(); 

router.get('/:id', function(req, res) {
	var correctRoute = gameServer.sendRoute(req.session.username, req.params.id);
	if (correctRoute == ('/initialization/' + req.params.id)
			|| correctRoute == ('/setBoats/' + req.params.id)) {
	 	res.render('initialize', {id: req.params.id});
	 }
	 else {
	 	res.redirect(correctRoute);
	 }
});

router.use(function(req, res, next) {
	res.redirect(gameServer.sendRoute(req.session.username, null))
});


module.exports = router;