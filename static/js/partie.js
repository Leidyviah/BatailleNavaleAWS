// Connection du client to socket.io
var socket = io();
const messageContainer = document.getElementById('message-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')

Vue.http.options.emulateJSON = true;

const redCross = "https://zupimages.net/up/20/15/q21v.png";
const blackSlash = "https://zupimages.net/up/20/15/zqhx.png";

function findBoatImg(boats, x, y) {
	for (boat in boats) {
		for (coord in boats[boat].coordinatesList) {
			if (boats[boat].coordinatesList[coord][0] == x && boats[boat].coordinatesList[coord][1] == y) {
				return {"img": boats[boat].imgSrcList[coord],
					"dir": boats[boat].direction};
			}
		}
	}
};

//vue contenant la liste des rooms
var game = new Vue({

	//l'id du DIV
	el: '#game',

	//les donnée de la partie qui doivent être transmise à la page html
	data: {
		battleship : {grid: [], attack_grid: [], 
			boats: {}, enemySunkBoat: {}},
		errors: [],
		serverMessage: '',
	},

	
	//cette fonction est appelée quand la vue est déjà créée
	created: function() {

		// MAJ des grilles quand une attaque a été effectuée
		socket.on('attack', function(response) {
			let room = window.location.pathname.split[2];
			if(reponse.gameName == room){
				this.battleship  = response.battleship;
				this.serverMessage = response.message;
			}
		}.bind(this));

		// envoyer un message disant d'attendre
		socket.on('wait', function(response) {
			let room = window.location.pathname.split[2];
			if(reponse.gameName == room){
				this.serverMessage = response.message;
			}
		}.bind(this));

		// à la fin de la partie envoyer un message disant 'gg wp' ou bien 'you lose' 
		socket.on('finish', function(response) {
			let room = window.location.pathname.split[2];
			if(reponse.gameName == room){
				this.serverMessage = response.message;
				$('#myModal').modal('show');
			}
		}.bind(this));

		//déconnexion
		socket.on('logout', function(response) {
			window.location.href = '/logout';
		});
		appendMessage('You joined');
		socket.emit('new-user', window.location.pathname.split[2]);

		socket.on('user-connected', function(message) {
			let room = window.location.pathname.split[2];
			if(room === message.gameName) {
				appendMessage(`{message.name}: ${message.message}`);
			}
		})
		socket.on('chat-message', function(message) {
			let room = window.location.pathname.split[2];
			if(room === message.gameName) {
				appendMessage(`${message.name}: ${message.message}`);
			}
		})

		messageForm.addEventListener('submit', e => {
 		 	e.preventDefault()
  			const message = messageInput.value
  			appendMessage(`You: ${message}`)
  			socket.emit('send-chat-message', message, window.location.pathname.split[2])
  			messageInput.value = ''
		});

		function appendMessage(message) {
  			const messageElement = document.createElement('div')
  			messageElement.innerText = message
  			messageContainer.append(messageElement)
		}

	
		//récupérer les informations de la grille (bateaux)
	    this.$http.get(window.location.pathname + '/getBattleship').then(function(response) {
	        this.battleship = response.body.battleship;
	    });
	},

	// ce sont les méthodes à utiliser dans l'app (on les stock ici)
	methods: {
		
		//attaquer
		attack: function(row, col, event) {
			socket.emit('attack', attackCoordinates = {row: row - 1, col: col - 1},
				window.location.pathname.split[2]);
		},

		attackCellClass: function(row, col) {

			let result = {};

			//vérifie si la grille n'est pas définie, ce sera fait avant de recevoir les maj
			if (this.battleship.attack_grid[row-1]) {
				//retourne une classe selon la valeur de la case
				switch (this.battleship.attack_grid[row-1][col-1]) {
					case 0:
						result = {'btn-default': true};
						break;
					case 1:
						result = {'btn-primary': true};
						break;
					case 2:
						result = {'btn-basic': true, 'bounceIn': true};
						break;
					case 3:
						result = {'btn-warning': true, 'bounceIn': true};
						break;
					case 4:
						result = {'btn-danger': true, 'bounceIn': true};
						break;
					default:
						result = {};
						break;
				}
				return result;
			}
			else {
				return result;
			}
		},
		
		attackCellImg: function(row, col) {
			let result = "&nbsp;"
			if (this.battleship.attack_grid[row-1]) {
				switch (this.battleship.attack_grid[row-1][col-1]) {
					case 0:
						result = "&nbsp;";
						break;
					case 1:
						result = "&nbsp;";
						break;
					case 2:
						result = "&nbsp;";
						break;
					case 3:
						result = "<img src=\"" + redCross + "\" class:\"superposed\" />";
						break;
					case 4:
						let img = findBoatImg(this.battleship.enemySunkBoat, row-1, col-1);
						result = "<img src=\"" + img['img'] + "\" class=\"" + img['dir'] + "\" />"
							+ "<img src=\"" + blackSlash + "\" class:\"superposed\" />";
						break;
				}
			}
			return result;
		},

		myCellClass: function(row, col) {
			let result = {};

			//vérifie si la grille n'est pas définie, ce sera fait avant de recevoir les maj
			if (this.battleship.grid[row-1]) {
				//retourne une classe selon la valeur de la case
				switch (this.battleship.grid[row-1][col-1]) {
					case 0:
						result = {'btn-default': true};
						break;
					case 1:
						result = {'btn-primary': true};
						break;
					case 2:
						result = {'btn-basic': true, 'bounceIn': true};
						break;
					case 3:
						result = {'btn-warning': true, 'bounceIn': true};
						break;
					case 4:
						result = {'btn-danger': true, 'bounceIn': true};
						break;
					default:
						result = {};
						break;
				}
				return result;
			}
			else {
				return result;
			}
		},
		
		myCellImg: function(row, col) {
			let result = "&nbsp;"
			if (this.battleship.grid[row-1]) {
				switch (this.battleship.grid[row-1][col-1]) {
					case 0:
						result = "&nbsp;";
						break;
					case 1:
						let img3 = findBoatImg(this.battleship.boats, row-1, col-1);
						result = "<img src=\"" + img3['img'] + "\" class=\"" + img3['dir'] + "\" />";
						break;
					case 2:
						result = "&nbsp;";
						break;
					case 3:
						let img = findBoatImg(this.battleship.boats, row-1, col-1);
						result = "<img src=\"" + img['img'] + "\" class=\"" + img['dir'] + "\" />"
							+ "<img src=\"" + redCross + "\" class:\"superposed\" />";
						break;
					case 4:
						let img2 = findBoatImg(this.battleship.boats, row-1, col-1);
						result = "<img src=\"" + img2['img'] + "\" class=\"" + img2['dir'] + "\" />"
							+ "<img src=\"" + blackSlash + "\" class:\"superposed\" />";
						break;
				}
			}
			return result;
		},

	},
});
