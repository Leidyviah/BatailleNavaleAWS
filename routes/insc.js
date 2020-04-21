var express = require('express');
var gameServer = require('../server.js').gameServer;
var io = require('../server.js').io;


var router = express.Router(); 



router.get('/', function(req, res) {
	var username = req.session.username;

   if(req.session.username){
        
    var correctRoute = gameServer.sendRoute(req.session.username);
	res.redirect(correctRoute);

	}
   else
   {
   	    res.render('insc');
		
    };
	
	
	 
});


module.exports = router;