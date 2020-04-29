var clientServer = function(gameServer, io) {


	var self = this; //ça permet d'éviter les conflits

	self.io = io;

	self.gameServer = gameServer;
	
	

	// Initialisation de socket io

	self.init = function() {
		
		self.io.on('connection', function(socket) {

			// si le joueur est enregistré
			if (self.getUsername(socket)) {
				self.gameServer.players[self.getUsername(socket)].saveSocketId(socket.id);
				/*
				// vérifie si il a déja rejoint une partie
				if (self.getUserGame(socket)) {

					// partie solo
					if (self.getUserGame(socket).gameType == 'solo') {
						*/
					socket.on('beginSoloGame', function(gameName){
						self.handleSoloConnection(socket, gameName);
					});
				/*						
					} else {// partie multi
					*/
					socket.on('beginMultiGame', function(gameName) {
						self.handleMultiplayerInitialization(socket, gameName);
						self.handleMultiplayerGameConnection(socket, gameName);
					});
					/*}

					
				} else {//sinon on lui propose les room existantes
					self.sendAvailableGames(socket);
				}
				*/
				
				socket.on('new-user', function(gameName) {
					socket.broadcast.to(self.getEnemyPlayer(socket, gameName).socketId).emit('user-connected',{
						gameName: gameName,
						username: self.getUsername(socket)
					});
				});
				socket.on('send-chat-message', function(message, gameName) {
					socket.broadcast.to(self.getEnemyPlayer(socket, gameName).socketId).emit('chat-message', { gameName: gameName, message: message, name: self.getUsername(socket) })
				});
			} else {
				self.handleDisconnect(socket);
			}
		});
	};


/******************************** Socket io handlers *************************************/

	
	//socket pour la page d'initialisation
	self.handleMultiplayerInitialization = function(socket, gameName) {
		var username = self.getUsername(socket);
		var game = self.getUserGame(gameName);
		var player_one = game.player_one;
		var player_two = game.player_two;

		self.joinGameRoom(gameName);

		//si ce joueur a créé la partie en envoie des wait statuts car il doit attendre qu'un autre joueur rejoigne la room
		if (username == player_one.username) {
			self.sendWaitStatus(socket, gameName);
		}

		//si ce joueur rejoint une room on envoie un connect statut à celui qui l'a créé
		else {
			self.sendConnectStatus(socket, gameName);
		}

		socket.on('startGame', function(game) {//quand il appuie sur start on redirige les deux dans la page pour placer les bateaux
			if(name === gameName) {
				self.sendSetBoatStatus(socket, gameName);
			}
		});
	}

	// Socket io handler pour la page principale
	self.handleMultiplayerGameConnection = function(socket, gameName) {

		var username = self.getUsername(socket);

		var game = self.getUserGame(gameName);

		
		if (!game.isAvailable()) {
			
			var enemyPlayer = self.getEnemyPlayer(socket, gameName);

			if (!enemyPlayer.runningGames[game.name]["battleship"].areBoatsSet) {//le premier joueur à avoir fini de poser ses bateaux commence à jouer
				self.sendWaitForBoatStatus(socket, gameName);
				
				self.gameServer.players[self.getUsername(socket)].runningGames[game.name]["isTurn"] = true;
			}

			
			else {
				self.sendStartGameStatus(socket, gameName);
			}

			
			socket.on('attack', function(attackCoordinates, gameName) {
				if(game.name == gameName) {
					if (enemyPlayer.runningGames[game.name]["battleship"].areBoatsSet && 
							gameServer.players[username].runningGames[game.name]["isTurn"]) {
						
						var coordinates = [attackCoordinates.row, attackCoordinates.col];

						self.getUserBattleship(socket, game.name).attackEnemy(coordinates, enemyPlayer, game.name);

						if (enemyPlayer.runningGames[game.name]["battleship"].isFleetDestroyed()) {
							self.sendGameOverStatus(socket, game.name);
							self.deleteGame(game.name);
							//self.disconnectAllPlayersInGame(socket);
						}
						else {
							// tour de l'autre joueur
							
							self.gameServer.players[username].runningGames[game.name]["isTurn"] = false;
							enemyPlayer.runningGames[game.name]["isTurn"] = true;

							//envoyer aux deux joueurs qui sera le prochain tour à jouer
							self.sendNextTurnStatus(socket, game.name);
						}
					}
				}
			});
		}
	}
	
	self.deleteGame = function(gameName) {
		let game = self.gameServer.games[gameName];
		delete game.player_one.runningGames[gameName];
		delete game.player_two.runningGames[gameName];
		delete self.gameServer.games[gameName];
	}


	//retourner la partie où joue le client
	self.getUserGame = function(gameName) {
		return self.gameServer.games[gameName];
	}


	self.getUsername = function(socket) {
		return socket.handshake.session.username;
	}

	//retourner la grille du joueur actuelle
	self.getUserBattleship = function(socket, gameName) {
		return self.gameServer.players[self.getUsername(socket)].runningGames[gameName]["battleship"];
	}


	
	//envoyer un wait statue au joueur qui a créé la room si aucun joueur ne rejoint
	self.sendWaitStatus = function(socket, gameName) {
		var status = {
			gameName: gameName,
			status: 'waiting',
			message: 'Wait for a player to join...',
		}
		socket.emit('status', status);
	}

	
	//quand un joueur se connect à une room envoyer connect statu aux deux joueurs
	self.sendConnectStatus = function(socket, gameName) {

		var game = self.getUserGame(gameName);

		var player_one = game.player_one;
		var player_two = game.player_two;

		var status = {
			gameName: gameName,
			status: 'connected',
			message: "player " + player_two.username + " is connected now!",
		}
		socket.broadcast.to(player_one.socketId).emit('status', status);

		status.message = "You are  connected with " + player_one.username + " !";
		socket.emit('status', status);
	}


	self.sendAvailableGames = function(socket) {
		socket.emit('listGames', self.gameServer.availableGames);
	}

	self.joinGameRoom = function(gameName) {
		socket.join(gameName);
	}


	


	self.sendSetBoatStatus = function(socket, gameName) {
		var game = self.getUserGame(gameName);
		var response = {
			gameName: gameName,
			redirect: '/setBoats/' + gameName
		};
		
		self.io.sockets.in(game.name).emit('setBoats', response)
	}


	//l'adversaire de chaque joueur
	self.getEnemyPlayer = function(socket, gameName) {
		var game = self.getUserGame(gameName);
		var username = self.getUsername(socket);

		if (game.player_one.username == username) {
			return game.player_two;
		} else {
			return game.player_one;
		}
	}

	//attente que l'adversaire pose ses bateaux
	self.sendWaitForBoatStatus = function(socket, gameName) {
		var username = self.getUsername(socket);
		var enemyPlayer = self.getEnemyPlayer(socket, gameName);
		var response = {
			gameName: gameName,
			status : 'waiting',
			message: 'Waiting for ' + enemyPlayer.username + " to set boats",
		}
		socket.emit('wait', response);
	}

	
	self.sendStartGameStatus = function(socket, gameName) {
		var response = {
			gameName: gameName,
			message: 'Your turn.',
		}

		socket.broadcast.to(self.getEnemyPlayer(socket).socketId).emit('wait', response);
		response.message = "It is " + self.getEnemyPlayer(socket).username + "'s turn.";
		socket.emit('wait', response);
	}

	
	//prévenir le joueur que c'est son tour
	self.sendNextTurnStatus = function(socket, gameName) {
		response = {
			gameName: gameName,
			message: 'It is your turn',
			battleship: self.getEnemyPlayer(socket).battleship
		};
		socket.broadcast.to(self.getEnemyPlayer(socket).socketId).emit('attack', response);

		response = {
			gameName: gameName,
			message: "It is " + self.getEnemyPlayer(socket).username + "'s turn",
			battleship: self.getUserBattleship(socket)
		};

		socket.emit('attack', response);
	}
	
	self.sendGameOverStatus = function(socket, gameName) {
		var db = require("../jeu/connexion_db.js");
		var conn=db.getConnexionDb();
		var game = self.getUserGame(gameName);
		var player_one = game.player_one;
		var player_two = game.player_two;
		let data = { player_one: player_one, player_two: player_two};
		  let sql = "INSERT INTO parties SET ?";
		  let query = conn.query(sql, data,(err, results) => {
		    if(err) throw err;
		  });
		
		var response = {
			gameName: gameName,
			message: 'You lost. :(',
			battleship: self.getEnemyPlayer(socket).battleship
		};
		socket.broadcast.to(self.getEnemyPlayer(socket).socketId).emit('finish', response);
		response = {
			gameName: gameName,
			message: 'You won! ^^',
			battleship: self.getUserBattleship(socket)
		};
		socket.emit('finish', response);
	}

	

	

	//contre l'ia
	self.handleSoloConnection = function(socket, nameGame) {
		var player = self.gameServer.players[self.getUsername(socket)];
		var game = self.getUserGame(nameGame);

		player.isTurn = true;

		var enemyPlayer = game.player_two;

		enemyPlayer.battleship.randomSetBoats();

		socket.on('attack', function(attackCoordinates, nameGameS) {
			if(nameGame === nameGameS){
				if (player.runningGames[gameName]["isTurn"]) {
					var coordinates = [attackCoordinates.row, attackCoordinates.col];

					let att = self.getUserBattleship(socket, nameGame).attackEnemyAI(coordinates, enemyPlayer);
					self.sendAIResponse(socket, nameGame);

					if (enemyPlayer.battleship.isFleetDestroyed()) {
						self.sendGameOverStatus(socket, nameGame);
						/*setTimeout(function() {
							self.handleDisconnect(socket);
						}, 300000);*/
						let game = self.gameServer.games[gameName];
						delete game.player_one.runningGames[gameName];
						delete self.gameServer.games[gameName];
					}
					else {
						player.runningGames[gameName]["isTurn"] = false;
						var AIAttack_coordinates = enemyPlayer.guessCoordinates();
						enemyPlayer.attackEnemy(AIAttack_coordinates, player, gameName);

						if (self.getUserBattleship(socket, nameGame).isFleetDestroyed()) {
							self.sendGameOverStatus(socket, nameGame);

							/*setTimeout(function() {
								self.handleDisconnect(socket);
							}, 300000);*/
							let game = self.gameServer.games[gameName];
							delete game.player_one.runningGames[gameName];
							delete self.gameServer.games[gameName];
						}

						setTimeout(function () {
							player.runningGames[gameName]["isTurn"] = true;
							self.sendSoloResponse(socket, nameGame);
						}, 500);
					}
				}
			}
		})
	};


	//contre l'ia
	self.sendAIResponse = function(socket, gameName) {
		response = {
			gameName: gameName,
			message: "AI's turn.",
			battleship: self.getUserBattleship(socket)
		};
		socket.emit('attack', response);
	}

	
	self.sendSoloResponse = function(socket, gameName) {
		response = {
			gameName: gameName,
			message: "Your turn.",
			battleship: self.getUserBattleship(socket)
		};
		socket.emit('attack', response);
	}

	//déconnexion
	self.handleDisconnect = function(socket) {
		var response = {
			message: 'You\'re not connected',
			redirect: '/'
		}
		socket.emit('logout', response);
		socket.disconnect();
	}

	//déconnecter tout le monde 
	/*self.disconnectAllPlayersInGame = function(socket) {
		setTimeout(function() {
			
self.handleDisconnect(self.io.sockets.connected[self.getEnemyPlayer(socket).socketId
]);
			self.handleDisconnect(socket);
		}, 300000);
	}*/
};

module.exports = clientServer;
