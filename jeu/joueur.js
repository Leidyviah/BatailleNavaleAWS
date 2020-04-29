var battleship = require('./grille.js');

function player(username) {

	this.username = username;
	this.runningGames = {}; //objets {battleship, game, isTurn}


	this.socketId = null;//à revoir une fois les sockets étudiés


	//sauvegarder le socket ID du joueur
	this.saveSocketId = function(socketId) {
		this.socketId = socketId;
	};

	
	//connecte ce joueur à une salle en tant que joueur 2
	this.joinGame = function(game) {
		this.runningGames[game.name] = {
			"battleship": new battleship(),
			"game":  game,
			"isTurn": false
		};
		this.runningGames[game.name]["game"].player_two = this.username;
	};
	
	//connecte ce joueur à une salle en tant que joueur 1
	this.createGame = function(game) {
		this.runningGames[game.name] = {
			"battleship": new battleship(),
			"game":  game,
			"isTurn": false
		}
	};
};

module.exports = player; 