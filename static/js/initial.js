// Connection du client to socket.io
var socket = io.connect();

Vue.http.options.emulateJSON = true;

// vue contenant les info du joueur
var gameStatus = new Vue({

    // l'is du DIV
    el: '#gameStatus',

    // donénes pour la page
    data: {
        status: '',
        message: '',
        game: '',
    },

    // cette fonction est appelé à la création de l'instance'
    created: function() {
        socket.on('status', function(status) {

            this.message = status.message;
            this.status = status.status;
            this.game = status.gameRoom;

            //si le joueur rejoint une room
            if (status.status == 'connected') {
                $('button').removeClass('hidden');
            }
        }.bind(this));

        /*socket.on('quit', function(response) {
            window.location.href = '/quit';
        });*/
    },

    
    methods: {
        startGame: function(event) {
            socket.emit('startGame');
        }
    },
});

//quand le joueur click sur start(quand il rejoint une room), tout les joueurs sont dirigés vers la page où il placeront leurs bateaux
socket.on('setBoats', function(response) {
    window.location.href = response.redirect;
});