Vue.http.options.emulateJSON = true;

//créer la vue qui contient les infos de l'utilisateur
var createGame = new Vue({

	//l'id du DIV
	el: '#createGame',


	data: {
		messages: [], // Message pour le joueur si il y a un erreur
		username: '',
		gameName: '',
	},

	// ce sont les méthodes à utiliser dans l'app (on les stock ici)
	methods: {
		uploadForm: function(event) {
			// vider les message d'erreur (réinitialiser)
			this.messages = [];
      let error = false;
			//si les infos ne sont pas correctement entrées
			/*if (this.username == '') { //l'utilisateur connecté n'a pas d'input username
				this.messages.push('Add username');
      }*/

			if (this.gameName == '') {
				this.messages.push('Add room name')
        error = true;
			}
      
      if (!error)
			{
				//si les infos sont correctement entrées
				this.$http.post('/createGame', {
						username: this.username,
						gameName: this.gameName
					})
					.then(function(response) {
						// aucun souci
						window.location.href = response.data.redirect;
					}, function(response) {
						// echec
						if (response.status == 406) {
							this.messages.push(response.data.message);
						} else {
							console.log(response);
						}
					});
			}
		}
	}
});
