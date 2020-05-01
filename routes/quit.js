var express = require('express');
var gameServer = require('../server.js').gameServer;
var io = require('../server.js').io;



var router = express.Router(); 


router.get('/', function(req, res) {

	var username = req.session.username;
  //quit le jeu
  if (gameServer.players[username].game) {
    let game = gameServer.players[username].game;
    
    if(game.gameType == "multi"){
      let enemy;
      if(game.player_one.username === username) {
        if(game.player_two)
          enemy = game.player_two.socketId;
      } else {
        if(game.player_one)
          enemy = game.player_one.socketId;
      }
      if(enemy)
        io.sockets.to(enemy).emit('quit');
      game.gameType = 'solo';
    }
    gameServer.removeGame(game.name);
    gameServer.updateAvailableGames();
  }
  if(!req.session.loggedin){
    gameServer.removePlayer(username);
    req.session.destroy();
  }
  
	res.redirect('/');
});

module.exports = router;