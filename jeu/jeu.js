function game(name, player_one) {

	this.name = name;
	this.player_one = player_one;
	this.player_two = null;
	this.gameType  = 'multi'; //ou bien 'solo'


	//vérifie si il est possible de rejoindre la game
	this.isAvailable = function() {
		return this.player_two == null && this.gameType == 'multi';
	};

};

module.exports = game;