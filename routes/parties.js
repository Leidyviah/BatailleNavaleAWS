var express = require('express');
var gameServer = require('../server.js').gameServer;
var io = require('../server.js').io;


var router = express.Router(); 



router.get('/', function(req, res) {
	var correctRoute = gameServer.sendRoute(req.session.username);
	if (correctRoute == '/parties' ) {
	 	res.render('parties');
	 }
	 else {
	 	res.redirect(correctRoute);
	 }
	 
});


module.exports = router;