var gameServer = require('../server.js').gameServer;
var io = require('../server.js').io;





router.get('/', function(req, res) {
	var username = req.session.username;

   if(req.session.loggedin){
        
    var correctRoute = gameServer.sendRoute(req.session.username);
	res.redirect(correctRoute);

	}
   else
   {
   	    res.render('insc');
		
    };
	
	
	 
});


//module.exports = router;