var battleship = require('./grille.js');

function player(username) {

	this.username = username;
	this.battleship = new battleship();
	this.game = null;
	this.isTurn = false;


	this.socketId = null;//à revoir une fois les sockets étudiés


	//sauvegarder le socket ID du joueur
	this.saveSocketId = function(socketId) {
		this.socketId = socketId;
	};

	
	//connecte ce joueur à une salle
	this.joinGame = function(game) {
		this.game = game;
		this.game.player_two = this.username;
	};
  
  this.quitGame = function() {
    this.game = null;
  }
};

module.exports = player; 