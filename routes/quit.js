var express = require('express');
var gameServer = require('../server.js').gameServer;
var io = require('../server.js').io;



var router = express.Router(); 


router.get('/', function(req, res) {

	var username = req.session.username;
  
  //quit le jeu
  if (gameServer.players[username].game) {
    let game = gameServer.players[username].game;
    
    if(!(game.player_two===null || game.player_one===null)){
      let enemy;
      if(game.player_one.username == req.session.username){
        enemy = game.player_two.socketId;
        game.player_one.quitGame();
        game.player_one = null;
      } else {
        enemy = game.player_one.socketId;
        game.player_two.quitGame();
        game.player_two = null;
      }
      io.sockets.to(enemy).emit('quit');
    }
    
    gameServer.removeGame(game.name);
    gameServer.updateAvailableGames();
  }
	/*if (!req.session.loggedin){
    gameServer.removePlayer(username);
    req.session.destroy();
	} else {
    req.session.username = username;
  }*/
	res.redirect('/');
});

module.exports = router;