var express = require('express');
var gameServer = require('../server.js').gameServer;
var io = require('../server.js').io;

var router = express.Router(); 

router.get('/', function(req, res) {
	var username = req.session.username;

	if (username) {

        res.redirect('joueurs')
		
	}

    else
	res.redirect('/'); 
});

module.exports = router;