var player = require('./joueur.js'); 
var game = require('./jeu.js'); 
var AI = require('./ia.js'); 

function gameServer() {

	this.games = {};//liste des parties
	this.availableGames = {};
	this.players = {};//tout les joueurs actuels

	//explicite
	this.createMultiplayerGame = function(gameName, player_one) {

		this.games[gameName] = new game(gameName, player_one);
		
		player_one.createGame(this.games[gameName]);

		this.updateAvailableGames();
	};
	
	//Joueur2 rejoint une partie multi
	this.joinMultiplayerGame = function(gameName, player_two) {

		player_two.joinGame(this.games[gameName]);
		
		/////
		this.games[gameName].player_two = player_two; 

		this.updateAvailableGames();
	};

	//explicite
	this.createSoloGame = function(player) {
		
		var Game = new game(player.username, player);

		this.games[player.username] = Game;

		Game.gameType = 'solo'; 

		Game.player_two = new AI(Game); //contre l'ordinateur

		this.players[player.username].createGame(Game);
	};



	this.updateAvailableGames = function() {
		newDict = {};
		for (var element in this.games) {
			if (this.games[element].isAvailable()) {
				newDict[element] = {
					'name': this.games[element].name,
					'player_one': this.games[element].player_one.username
				};
			}
		}
		this.availableGames = newDict;
	};


	//delete la partie
	this.removeGame = function(gameName) {
		delete this.games[gameName];
	};


	
	//vérifie si le nom de la partie existe
	this.gameNameAlreadyExists = function(gameName) {
		if (this.games[gameName]) {
			return true;
		}
		return false;
	}

	//ajouter un joueur
	this.newPlayer = function(username) {
		this.players[username] = new player(username);
	};

	//retirer un joueur qui a quitter le site
	this.removePlayer = function(username) {
		delete this.players[username];
	};

	//vérifie si ce pseudo existe
	this.usernameAlreadyExists = function(username) {
		if (this.players[username]) {
			return true;
		}
		return false;
	};

	//envoie la route adéquate selon l'utilisateur
	this.sendRoute = function(username, nameGame) {
		
		if (username && this.games[nameGame]) { //vérifie si le joueur a un pseudo, et si une partie de ce nom existe
			
			if (this.players[username].runningGames[nameGame]) {//vérifie si le joueur est déjà associé à cette partie

				//si le joueur est connecté a une autre partie ou bien joue en solo
				if (!this.players[username].runningGames[nameGame]["game"].isAvailable() || this.players[username].runningGames[nameGame]["game"].gameType == 'solo') {
					
					if (this.players[username].runningGames[nameGame]["battleship"].areBoatsSet) {//vérifie si les bateau sont positionnés

						return '/game/' + nameGame;

					}else {

						return '/setBoats/' + nameGame;

					}
				}
				else {//si le joueur a créé une partie en multi et que perosnne n'a rejoint

					return '/initialization/' + nameGame; 

				}
			}
			else {//user existe déjà
				return '/join'; 
			}
		}
		else {// retour à l'acceuil si il n'a pas de pseudo
			return '/';
		}
	}
}

module.exports = gameServer;