var express = require('express');
var gameServer = require('../server.js').gameServer;
var io = require('../server.js').io;



var router = express.Router(); 


router.get('/', function(req, res) {

	var username = req.session.username;
  var enemy = null;
  //quit le jeu
  if (gameServer.players[username].game) {
    let game = gameServer.players[username].game;
    
    if(game.gameType == "multi"){
      
      gameServer.removeGame(game.name);
      gameServer.updateAvailableGames();
    }
  }
  if(!req.session.loggedin){
    gameServer.removePlayer(username);
    req.session.destroy();
  }
	res.redirect('/');
});

module.exports = router;