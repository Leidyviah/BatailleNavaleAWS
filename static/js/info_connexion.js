// Connection du client to socket.io
var socket = io();

Vue.http.options.emulateJSON = true;

//création d'une vue pour transmettre les infos de connexions
var infosConnexion = new Vue({
  el: '#infos_connexion',
  data: {
    message: ''
  },
  created: function() {
    socket.on("infos-connexion", function(message){
      this.message = message;
    }).bind(this);
    socket.emit("infos-connexion");
  }                        
});