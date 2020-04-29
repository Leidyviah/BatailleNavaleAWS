var clientServer = function(gameServer, io) {


	var self = this; //ça permet d'éviter les conflits

	self.io = io;


	self.gameServer = gameServer;

	// Initialisation de socket io

	self.init = function() {
		
		self.io.on('connection', function(socket) {

			// si le joueur est enregistré
			if (self.getUsername(socket)) {

				// vérifie si il a déja rejoint une partie
				if (self.getUserGame(socket)) {

					// partie solo
					if (self.getUserGame(socket).gameType == 'solo') {
						self.handleSoloConnection(socket);					
					} else {// partie multi
						self.handleMultiplayerInitialization(socket);
						self.handleMultiplayerGameConnection(socket);
					}

				} else {//sinon on lui propose les room existantes
					self.sendAvailableGames(socket);
				}
				
			} else {
				self.handleDisconnect(socket);
			}
			socket.on('new-user', function() {
				socket.broadcast.emit('user-connected',self.getUsername(socket))
				});
				socket.on('send-chat-message', message => {
					socket.broadcast.to(self.getEnemyPlayer(socket).socketId).emit('chat-message', { message: message, name: self.getUsername(socket) })
				});
      socket.on("info-connexion", function() {
        let infos;
        if(socket.handshake.session.loggedin) {
          infos = "Vous êtes connecté sous " + self.getUsername(socket);
    
        }
        socket.
      })
		});
	};


/******************************** Socket io handlers *************************************/

	
	//socket pour la page d'initialisation
	self.handleMultiplayerInitialization = function(socket) {
		var username = self.getUsername(socket);
		var game = self.getUserGame(socket);
		var player_one = game.player_one;
		var player_two = game.player_two;

		self.joinGameRoom(socket);

		self.gameServer.players[username].saveSocketId(socket.id);
		//si ce joueur a créé la partie en envoie des wait statuts car il doit attendre qu'un autre joueur rejoigne la room
		if (username == player_one.username) {
			self.sendWaitStatus(socket);
		}

		//si ce joueur rejoint une room on envoie un connect statut à celui qui l'a créé
		else {
			self.sendConnectStatus(socket);
		}

		
		socket.on('startGame', function() {//quand il appuie sur start on redirige les deux dans la page pour placer les bateaux
			self.sendSetBoatStatus(socket);
		});
	}

	// Socket io handler pour la page principale
	self.handleMultiplayerGameConnection = function(socket) {

		var username = self.getUsername(socket);

		var game = self.getUserGame(socket);

		
		if (!game.isAvailable()) {
			
			var enemyPlayer = self.getEnemyPlayer(socket);

			if (!enemyPlayer.battleship.areBoatsSet) {//le premier joueur à avoir fini de poser ses bateaux commence à jouer
				self.sendWaitForBoatStatus(socket);
				self.gameServer.players[self.getUsername(socket)].isTurn = true;
			}

			
			else {
				self.sendStartGameStatus(socket);
			}

			
			socket.on('attack', function(attackCoordinates) {
				if (enemyPlayer.battleship.areBoatsSet && gameServer.players[username].isTurn) {
					
					var coordinates = [attackCoordinates.row, attackCoordinates.col];

					self.getUserBattleship(socket).attackEnemy(coordinates, enemyPlayer);

					if (enemyPlayer.battleship.isFleetDestroyed()) {
						self.sendGameOverStatus(socket);
						self.disconnectAllPlayersInGame(socket);
					}
					else {
						// tour de l'autre joueur
						self.gameServer.players[username].isTurn = false;
						enemyPlayer.isTurn = true;

						//envoyer aux deux joueurs qui sera le prochain tour à jouer
						self.sendNextTurnStatus(socket);
					}
				}
			});
		}
	}



	//retourner la partie où joue le client
	self.getUserGame = function(socket) {
		return self.gameServer.players[self.getUsername(socket)].game;
	}


	self.getUsername = function(socket) {
		return socket.handshake.session.username;
	}

	//retourner la grille du joueur actuelle
	self.getUserBattleship = function(socket) {
		return self.gameServer.players[self.getUsername(socket)].battleship;
	}


	
	//envoyer un wait statue au joueur qui a créé la room si aucun joueur ne rejoint
	self.sendWaitStatus = function(socket) {
		var status = {
			status: 'waiting',
			message: 'Wait for a player to join...',
		}
		socket.emit('status', status);
	}

	
	//quand un joueur se connect à une room envoyer connect statu aux deux joueurs
	self.sendConnectStatus = function(socket) {

		var game = self.getUserGame(socket);

		var player_one = game.player_one;
		var player_two = game.player_two;

		var status = {
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

	self.joinGameRoom = function(socket) {
		var game = self.getUserGame(socket);
		socket.join(game.name);
	}


	


	self.sendSetBoatStatus = function(socket) {
		var game = self.getUserGame(socket);
		var response = {
			redirect: '/setBoats'
		};




		self.io.sockets.in(game.name).emit('setBoats', response)
	}


	//l'adversaire de chaque joueur
	self.getEnemyPlayer = function(socket) {
		var game = self.getUserGame(socket);
		var username = self.getUsername(socket);

		if (game.player_one.username == username) {
			return game.player_two;
		} else {
			return game.player_one;
		}
	}

	//attente que l'adversaire pose ses bateaux
	self.sendWaitForBoatStatus = function(socket) {
		var username = self.getUsername(socket);
		var enemyPlayer = self.getEnemyPlayer(socket);
		var response = {
			status : 'waiting',
			message: 'Waiting for ' + enemyPlayer.username + " to set boats",
		}
		socket.emit('wait', response);
	}

	
	self.sendStartGameStatus = function(socket) {
		var response = {
				message: 'Your turn.',
			}

		socket.broadcast.to(self.getEnemyPlayer(socket).socketId).emit('wait', response);
		response.message = "It is " + self.getEnemyPlayer(socket).username + "'s turn.";
		socket.emit('wait', response);
	}

	
	//prévenir le joueur que c'est son tour
	self.sendNextTurnStatus = function(socket) {
		response = {
			message: 'It is your turn',
			battleship: self.getEnemyPlayer(socket).battleship
		};
		socket.broadcast.to(self.getEnemyPlayer(socket).socketId).emit('attack', response);

		response = {
			message: "It is " + self.getEnemyPlayer(socket).username + "'s turn",
			battleship: self.getUserBattleship(socket)
		};

		socket.emit('attack', response);
	}
	
	self.sendGameOverStatus = function(socket) {
		var db = require("../jeu/connexion_db.js");
		var conn=db.getConnexionDb();
		var game = self.getUserGame(socket);
		var player_one = game.player_one;
		var player_two = game.player_two;
		let data = { player_one: player_one, player_two: player_two};
		  let sql = "INSERT INTO parties SET ?";
		  let query = conn.query(sql, data,(err, results) => {
		    if(err) throw err;
		  });
		var response = {
			message: 'You lost. :(',
			battleship: self.getEnemyPlayer(socket).battleship
		};
		socket.broadcast.to(self.getEnemyPlayer(socket).socketId).emit('finish', response);
		response = {
			message: 'You won! ^^',
			battleship: self.getUserBattleship(socket)
		};
		socket.emit('finish', response);
	}

	

	

	//contre l'ia
	self.handleSoloConnection = function(socket) {
		var player = self.gameServer.players[self.getUsername(socket)];
		var game = self.getUserGame(socket);

		player.isTurn = true;

		var enemyPlayer = game.player_two;

		enemyPlayer.battleship.randomSetBoats();

		socket.on('attack', function(attackCoordinates) {
			if (player.isTurn) {
				var coordinates = [attackCoordinates.row, attackCoordinates.col];

				let att = self.getUserBattleship(socket).attackEnemy(coordinates, enemyPlayer);
				self.sendAIResponse(socket);

				if (enemyPlayer.battleship.isFleetDestroyed()) {
					self.sendGameOverStatus(socket);
					setTimeout(function() {
						self.handleDisconnect(socket);
					}, 300000);
				}
				else {
					player.isTurn = false;
					var AIAttack_coordinates = enemyPlayer.guessCoordinates();
					enemyPlayer.attackEnemy(AIAttack_coordinates, player);

					if (self.getUserBattleship(socket).isFleetDestroyed()) {
						self.sendGameOverStatus(socket);

						setTimeout(function() {
							self.handleDisconnect(socket);
						}, 300000);
					}

					setTimeout(function () {
						player.isTurn = true;
						self.sendSoloResponse(socket);
					}, 500);
				}

			}
		})
	};


	//contre l'ia
	self.sendAIResponse = function(socket) {
		response = {
			message: "AI's turn.",
			battleship: self.getUserBattleship(socket)
		};
		socket.emit('attack', response);
	}

	
	self.sendSoloResponse = function(socket) {
		response = {
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
	self.disconnectAllPlayersInGame = function(socket) {
		setTimeout(function() {

			self.handleDisconnect(self.io.sockets.connected[self.getEnemyPlayer(socket).socketId]);
			self.handleDisconnect(socket);
		}, 300000);
	}
};

module.exports = clientServer;
