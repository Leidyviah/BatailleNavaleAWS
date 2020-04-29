// Connection du client to socket.io
var socket = io();

Vue.http.options.emulateJSON = true;

// création de la vue contenant toutes les parties
var listGames = new Vue({

	//l'id du DIV
	el: '#listGames',


	data: {
		gamesList : {},
		picked : '',
		message: '', // Message d'erreur
	},

	 // cette fonction est appelé à la création de l'instance
	created: function() {

		//les parties disponibles
		socket.on('listGames', function(availableGames) {
			this.gamesList  = availableGames;
		}.bind(this));

		// déconenxion
		socket.on('logout', function(response) {
			window.location.href = '/logout'; // redirection 
		});
	},

	
	methods: {
		Choose: function(event) {

			// si le joueur n'a pas fait de choix
			if (this.picked == '') {
				this.message = 'Choose a room from this list.';
			}
			else {
				// sinon rejoindre la partie
				this.$http.post('/join/game', {picked: this.picked})
					.then(function(response) {
						console.log("choose ", response.data.redirect);
						window.location.href = response.data.redirect;
					});
				}
			}
		}
	});