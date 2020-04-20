var express = require('express');
var gameServer = require('../server.js').gameServer;
var io = require('../server.js').io;


var router = express.Router(); 



router.get('/', function(req, res) {
	var username = req.session.username;


        
        res.render('insc')

	
    //else
    //{
		//var correctRoute = gameServer.sendRoute(req.session.username);
		//res.redirect(correctRoute);
    //}
	
	
	 
});


module.exports = router;