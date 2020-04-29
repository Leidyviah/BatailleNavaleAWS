// Connection du client to socket.io
var socket = io.connect();

Vue.http.options.emulateJSON = true;

// vue contenant les info du joueur
var gameStatus = new Vue({

    // l'is du DIV
    el: '#gameStatus',

    // données pour la page
    data: {
        status: '',
        message: '',
        game: '',
    },

    // cette fonction est appelé à la création de l'instance'
    created: function() {
        socket.on('status', function(status) {
			
			console.log(window);
			let room = window.location.pathname.split('/')[2];
			
			if(status.nameGame === room) {
				this.message = status.message;
				this.status = status.status;
				//this.game = status.gameRoom;

				//si le joueur rejoint une room
				if (status.status == 'connected') {
					$('button').removeClass('hidden');
				}
			}
        }.bind(this));

        socket.on('logout', function(response) {
            window.location.href = '/logout';
        });
    },

    
    methods: {
        startGame: function(event) {
			let room = window.location.pathname.split('/')[2];
            socket.emit('startGame', room);
        }
    },
});

//quand le joueur click sur start(quand il rejoint une room), tout les joueurs sont dirigés vers la page où il placeront leurs bateaux
socket.on('setBoats', function(response) {
	let room = window.location.pathname.split('/')[2];
	if(room === response.gameName) {
		window.location.href = response.redirect;
	}
});