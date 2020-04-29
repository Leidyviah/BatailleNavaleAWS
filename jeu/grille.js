var Boat = require('./bateau.js'); 

function battleship() {

	this.grid =  [
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
	];

	//grille de l'adversaire
	this.attack_grid = [
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
		];


	//ce sont les 5 bateaux qui sont dans les règles du jeu
	this.boats = {
		'carrier': new Boat('carrier', 5, [
			"https://zupimages.net/up/20/17/blht.png",
			"https://zupimages.net/up/20/17/jc22.png",
			"https://zupimages.net/up/20/17/qset.png",
			"https://zupimages.net/up/20/17/p18q.png",
			"https://zupimages.net/up/20/17/8ioo.png"
		]),
		'battleship': new Boat('battleship', 4, [
			"https://zupimages.net/up/20/15/dcwj.png",
			"https://zupimages.net/up/20/15/asvd.png",
			"https://zupimages.net/up/20/15/kjhz.png",
			"https://zupimages.net/up/20/15/j8jn.png"
		]),
		'cruiser': new Boat('cruiser', 3, [
			"https://zupimages.net/up/20/17/py6x.png",
			"https://zupimages.net/up/20/17/b8iy.png",
			"https://zupimages.net/up/20/17/avaa.png"
		]),
		'submarine': new Boat('submarine', 3, [
			"https://zupimages.net/up/20/15/0bx7.png",
			"https://zupimages.net/up/20/15/clgm.png",
			"https://zupimages.net/up/20/15/0pm2.png"
		]),
		'destroyer': new Boat('destroyer', 2, [
			"https://zupimages.net/up/20/15/s741.png",
			"https://zupimages.net/up/20/15/j94t.png"
		]),
	};

	this.areBoatsSet = false;

	this.enemySunkBoat = {};

	//vérifie si un bateau se trouve dans les coordonnées (x,y)
	this.checkPosition = function (x, y) {
		if (this.grid[x][y] == 1) {
			return true;
		}
		else {
			return false;
		}
	};

	
	 //vérifie si ses coordonnées ont déjà été testées
	this.areAttackCoordinatesTested = function(x,y) {
		if(this.attack_grid[x][y] == 0 || this.attack_grid[x][y] == 1) {
			return false;
		}
		return true;
	};

	
	//Attaque la grille enemie et changer sa valeur, 0 y'a rien, 1 y'a un bateau, 2 tir manqué, 3 tir touché, 4 bateau coulé
	this.attackEnemy = function(coordinates, enemyPlayer, gameName) {

		var x = coordinates[0];
		var y = coordinates[1];

		if (this.areAttackCoordinatesTested(x,y)) {
			console.log('Vous avez déjà tiré ici.');
			return false;
		}

		if (enemyPlayer.runningGames[gameName]["battleship"].checkPosition(x,y)) {

			enemyPlayer.runningGames[gameName]["battleship"].grid[x][y] = 3;
			this.attack_grid[x][y] = 3;

	
			var hitBoat = enemyPlayer.runningGames[gameName]["battleship"].findHitBoat(x, y);

			// Sink the boat if it was completely destroyed
			enemyPlayer.runningGames[gameName]["battleship"].sinkBoatIfDestroyed(hitBoat.name);
			this.sinkEnemyBoatIfDestroyed(hitBoat.name, enemyPlayer, gameName);
		}
		else {
			enemyPlayer.runningGames[gameName]["battleship"].grid[x][y] = 2;
			this.attack_grid[x][y] = 2;
		}
	};
	
	//Attaque la grille enemie d'une IA et changer sa valeur, 0 y'a rien, 1 y'a un bateau, 2 tir manqué, 3 tir touché, 4 bateau coulé
	this.attackEnemyAI = function(coordinates, enemyPlayer) {

		var x = coordinates[0];
		var y = coordinates[1];

		if (this.areAttackCoordinatesTested(x,y)) {
			console.log('Vous avez déjà tiré ici.');
			return false;
		}

		if (enemyPlayer.battleship.checkPosition(x,y)) {

			enemyPlayer.battleship.grid[x][y] = 3;
			this.attack_grid[x][y] = 3;

	
			var hitBoat = enemyPlayer.battleship.findHitBoat(x, y);

			// Sink the boat if it was completely destroyed
			enemyPlayer.battleship.sinkBoatIfDestroyed(hitBoat.name);
			this.sinkEnemyAIBoatIfDestroyed(hitBoat.name, enemyPlayer);
		}
		else {
			enemyPlayer.battleship.grid[x][y] = 2;
			this.attack_grid[x][y] = 2;
		}
	};


	//vérifie si tout les bateaux ont été coulé (fin de la partie)
	this.isFleetDestroyed = function() {
		flag = true;
		for (boat in this.boats) {
			if (!this.boats[boat].isSunk) {
				flag = false;
			}
		}
		return flag;
	}


	//vérifie si la position du bateau est valide
	this.positionIsNotValid = function(boat_name) {

		var boat = this.boats[boat_name];
		var error = [];//tableau contenant les erreurs faites

		for (var i=0; i<boat.coordinatesList.length; i++) {
			if (!this.isInGrid(boat.coordinatesList[i])) {
				error.push(boat.name + ' n\'est pas bien placé.')
			}
			if (!isZoneAvailable(boat.coordinatesList[i], this.grid)) {
				error.push( boat.name + ' est trop près d\'un autre bateau')
			}
		}
		if (error.length == 0) {
			return false;
		}
		return error;
	};

	

	//placer les bateau dans la grille du joueur
	this.setBoat = function (boat_name) {
		
		if (this.positionIsNotValid(boat_name)) {
			throw new Error({message: 'Position non valide'});
		}

        var boat = this.boats[boat_name];
        for (var i = 0; i < boat.size; i++) {
            this.grid[boat.coordinatesList[i][0]][boat.coordinatesList[i][1]] = 1;
        }

        boat.isSet = true;
	};



	//génération aléatoire des bateaux
	this.randomSetBoats = function () {

		for (var boat in this.boats) {

			while (!this.boats[boat].isSet) {

				var i = Math.floor(Math.random() * 10); // entier aléatoire entre 0 et 9
				var j = Math.floor(Math.random() * 10); 
				var rnd = Math.floor(Math.random() + 0.5); // booléen aléatoire

				var dir = "down".repeat(rnd) + "right".repeat(1-rnd);//selection aléatoire de la direction

				this.boats[boat].setPosition([i, j], dir);
				this.boats[boat].setCoordinatesList();

				if (!this.positionIsNotValid(boat)) {
					this.setBoat(boat);
				}
			}
		}
	}

	//retourne le bateau qui vient d'être touché
	this.findHitBoat = function(x, y) {
		
		for (boat in this.boats) {
			for (coordinates of this.boats[boat].coordinatesList) {
				if (coordinates[0] == x && coordinates[1] == y) {
					return this.boats[boat];
				}
			}
		}
	};

	//couler le bateau
	this.sinkBoatIfDestroyed = function(boat_name) {

		var test = true;
		for (coordinates of this.boats[boat_name].coordinatesList) {
			var x = coordinates[0];
			var y = coordinates[1];
			if (this.grid[x][y] != 3) {
				test = false;
				break;
			}
		}

		if (test) {
			this.boats[boat_name].sink();
			for (coordinates of this.boats[boat_name].coordinatesList) {
				var x = coordinates[0];
				var y = coordinates[1];
				this.grid[x][y] = 4;
			}
		}
	};


	//couler le bateau enemie
	this.sinkEnemyBoatIfDestroyed = function(boat_name, enemyPlayer, gameName) {
		if (enemyPlayer.runningGames[gameName]["battleship"].boats[boat_name].isSunk) {
			this.enemySunkBoat[boat_name] = enemyPlayer.runningGames[gameName]["battleship"].boats[boat_name];
			for (coordinates of enemyPlayer.runningGames[gameName]["battleship"].boats[boat_name].coordinatesList) {
				var x = coordinates[0];
				var y = coordinates[1];

				this.attack_grid[x][y] = 4;
			}
		}
	}
	
	//couler le bateau enemie, pour une IA
	this.sinkEnemyAIBoatIfDestroyed = function(boat_name, enemyPlayer) {
		if (enemyPlayer.battleship.boats[boat_name].isSunk) {
			this.enemySunkBoat[boat_name] = enemyPlayer.battleship.boats[boat_name];
			for (coordinates of enemyPlayer.battleship.boats[boat_name].coordinatesList) {
				var x = coordinates[0];
				var y = coordinates[1];

				this.attack_grid[x][y] = 4;
			}
		}
	}


	//vérifie si le bateau peut être placé ici (petit code trouver sur un forum)
	this.isInGrid = function(coordinates) {

		if (Math.min(9, Math.max(coordinates[0],0)) != coordinates[0] ) {
	        return false;
	    }

	    if (Math.min(9, Math.max(coordinates[1],0)) != coordinates[1] ) {
	        return false;
	    }

	    return true;
	};
};

//le nom est explicite
	function isZoneAvailable(coordinates, currentGrid) {
		var x = coordinates[0];
		var y = coordinates[1];

		for (var i = x-1; i <= x+1; i++) {
			for (var j = y-1; j <= y+1; j++) {
				if (i>=0 && i<=9 && j>=0 && j<=9) {
					if (currentGrid[i][j] != 0) {
						return false;
					}
				}
			}
		}
		return true;
	};



module.exports = battleship;
