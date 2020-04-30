var battleship = require('./grille.js');


function AI(game) {

	this.game = game;
	this.battleship = new battleship();

	this.possibleCoordinatesArray = createArray(10);//liste de toute les attaques possibles avec generation de nombre aléatoires
	
	//si le tir touche, cette liste sera remplie des nouvelles coordonées possibles vu que le tir a touché, quand le bateau aura coulé, cette liste sera vidée et rebelote
	this.possibleCoordinatesSubArray = [];

	//les cases déjà coulées
	this.hitCoordinates = [];

	
	//choisi aléatoirement des coordonées à tester qui sont dans possibleCoordinatesArray
	this.guessCoordinates = function() {

		var array = this.possibleCoordinatesArray;
		var subArray = this.possibleCoordinatesSubArray;

		
		if (subArray.length == 0) {
			var coordinates = array[Math.floor(Math.random() * array.length)];//choisir des coordonénes aléatoire si la liste des val possibles est vide
		}
		else {
			var coordinates = subArray[Math.floor(Math.random() * subArray.length)];//choisir une valeur aléatoire de la liste des val possibles
		}
		
		return coordinates;
	};



	//retourne la taille du bateau qui peut rentrer à ces coordonée horizontalement
	this.checkBoatPossibilityHorizontal = function(coordinates) {

		var col = 1;
		var plus = 1;

		while (this.battleship.isInGrid([coordinates[0], coordinates[1]+col]) && this.battleship.attack_grid[coordinates[0]][coordinates[1] + col] == 0) {
			plus++;
			col++;
		}

		col = 1;
		var minus = 0;

		while (this.battleship.isInGrid([coordinates[0], coordinates[1]-col]) && this.battleship.attack_grid[coordinates[0]][coordinates[1] - col] == 0) {
			minus++;
			col++;
		}

		var result = plus + minus;
		return result;
	}

	//retourne la taille du bateau qui peut rentrer à ces coordonée verticalement
	this.checkBoatPossibilityVertical = function(coordinates) {

		var x = coordinates[0];
		var y = coordinates[1];

		var plus = 1;
		var row = 1;

		while (this.battleship.isInGrid([coordinates[0]+row, coordinates[1]]) && this.battleship.attack_grid[coordinates[0] + row][coordinates[1]] == 0) {
			plus++;
			row++;
		}

		row = 1;
		var minus = 0;

		while (this.battleship.isInGrid([coordinates[0]-row, coordinates[1]]) && this.battleship.attack_grid[coordinates[0] - row][coordinates[1]] == 0) {
			minus++;
			row++;
		}

		var result =  plus + minus;
		return result;
	}

	//retourne l'index de quelques coordonées dans possibleCoordinatesArray
	this.findIndexOf = function(coordinates) {

		for (var i=0; i<this.possibleCoordinatesArray.length; i++) {

			if (coordinates[0] == this.possibleCoordinatesArray[i][0] &&  coordinates[1] == this.possibleCoordinatesArray[i][1]) {
				return i;
			}
		}
	}

	



	//nom explicite
	this.findSmallestEnemyBoatSize = function(enemyPlayer) {

		var minLength = 5;

		for (boat in enemyPlayer.battleship.boats) {

			//si la taille du bateau est inférieur à minLength et sile bateu n'est pas coulé
			if (enemyPlayer.battleship.boats[boat].size < minLength && !enemyPlayer.battleship.boats[boat].isSunk) {
				minLength = enemyPlayer.battleship.boats[boat].size;
			}
		}

		return minLength;
	}


	//les coordonées testées doivent être retirées de possibleCoordinatesArray pour qu'elle ne soit pas testée à nouveau
	this.evaluateArray = function(coordinatesList, enemyPlayer) {

		for (coordinates of coordinatesList) {
			var index = this.findIndexOf(coordinates);
			if (index) {
				this.possibleCoordinatesArray.splice(index, 1);//ajoute un élement à la liste possibleCoordinatesArray 
			}
		}




		// il faut mettre à jour toute les possibilitées

		var minLength = this.findSmallestEnemyBoatSize(enemyPlayer);

		for (var i=0; i<this.possibleCoordinatesArray.length; i++) {

			var horizontal = this.checkBoatPossibilityHorizontal(this.possibleCoordinatesArray[i], minLength);
			var vertical = this.checkBoatPossibilityVertical(this.possibleCoordinatesArray[i], minLength);

			var counter = Math.max(horizontal, vertical);

			if (counter<minLength) {
				this.possibleCoordinatesArray.splice(i, 1);//ajoute un élement à la liste possibleCoordinatesArray 
			}
		}
	};



	//evaluer les possibleCoordinatesSubArray selon les hitCoordinates, si le hitCoordinates n'est pas vide alorss remplir possibleCoordinatesSubArray avec toutes les possibilités
	this.evaluateSubArray = function() {
		//réinitialiser la liste des coordonées possibles
		this.possibleCoordinatesSubArray = [];

		//si il n'y a qu'un element (une case touchée seulement), elle attaque toute les cases adjacentes
		if (this.hitCoordinates.length == 1) {

			var coordinates = this.hitCoordinates[0];
			var row = coordinates[0];
			var col = coordinates[1];

			for (i=row-1; i<=row+1; i++) {
				if (this.battleship.isInGrid([i, col])) {
					if (this.battleship.attack_grid[i][col] == 0 && [i, col] != [row, col]) {
						this.possibleCoordinatesSubArray.push([i,col]);
					}
				}
			}

			for (j=col-1; j<=col+1; j++) {
				var array = [];
				if (this.battleship.isInGrid([row, j])) {
					if (this.battleship.attack_grid[row][j] == 0 && [row, j] != [row, col]) {
						this.possibleCoordinatesSubArray.push([row,j]);
					}
				}
			}
		}else if (this.hitCoordinates.length > 1 ) // si il y a deux cases touché alors au lieu de 4possibilité, on en a que deux
		{
			// get la direction du bateau
			var row = this.hitCoordinates[0][0];

			if (this.hitCoordinates[1][0] == row) {//horizontale

				//ordoner par ligne
				this.hitCoordinates.sort(function(a,b) {return a[1] - b[1]});//petit code du net pour le tri

				var x = this.hitCoordinates[0][0];
				var y = this.hitCoordinates[0][1];

				if (this.battleship.isInGrid([x, y-1]) && this.battleship.attack_grid[x][y-1] == 0) {
					this.possibleCoordinatesSubArray.push([x, y-1]);
				}

				// le bateau ennemi est à la verticale
				var length = this.hitCoordinates.length;

				x = this.hitCoordinates[length-1][0];
				y = this.hitCoordinates[length-1][1];

				if (this.battleship.isInGrid([x, y+1]) && this.battleship.attack_grid[x][y+1] == 0) {
					this.possibleCoordinatesSubArray.push([x, y+1]);
				}
			}
			else {//verticale

				// Ordoner par colonne
				this.hitCoordinates.sort(function(a,b) {return a[0] - b[0]});

				var x = this.hitCoordinates[0][0];
				var y = this.hitCoordinates[0][1];

				if (this.battleship.isInGrid([x-1, y]) && this.battleship.attack_grid[x-1][y] == 0) {
					this.possibleCoordinatesSubArray.push([x-1, y]);
				}

				// le bateau ennemi est à la verticale

				var length = this.hitCoordinates.length;

				x = this.hitCoordinates[length-1][0];
				y = this.hitCoordinates[length-1][1];

				if (this.battleship.isInGrid([x+1, y]) && this.battleship.attack_grid[x+1][y] == 0) {
					this.possibleCoordinatesSubArray.push([x+1, y]);
				}
			}
		}
	};

	//attaquer la grille ennemie après avoir recalculer les listes hitCoordinates possibleCoordinatesArray et possibleCoordinatesSubArray
	this.attackEnemy = function(attack_coordinates, enemyPlayer) {
		var x = attack_coordinates[0];
		var y = attack_coordinates[1];

		

		// tout d'abord vérifier si l'ia a touché une case en dernier (sans bateau coulé)
		if (enemyPlayer.battleship.checkPosition(x,y)) {
			this.hitCoordinates.push([x,y]);

			// attaquer
			this.battleship.attackEnemy(attack_coordinates, enemyPlayer);

			var hitBoat = enemyPlayer.battleship.findHitBoat(x,y);
			if(hitBoat.isSunk) {
				var first = hitBoat.coordinatesList[0];
				var last = hitBoat.coordinatesList[hitBoat.coordinatesList.length-1];
				if (hitBoat.direction == 'right') {

					if (this.battleship.isInGrid([first[0], first[1] - 1])) {
						this.hitCoordinates.push([first[0], first[1] - 1]);
					}
					if (this.battleship.isInGrid([last[0], last[1] + 1])) {
						this.hitCoordinates.push([last[0], last[1] + 1]);
					}
					for (coordinates of hitBoat.coordinatesList) {
						if (this.battleship.isInGrid([coordinates[0] + 1, coordinates[1]])) {
							this.hitCoordinates.push([coordinates[0] + 1, coordinates[1]]);
						}
						if (this.battleship.isInGrid([coordinates[0] - 1, coordinates[1]])) {
							this.hitCoordinates.push([coordinates[0] - 1, coordinates[1]]);
						}
					}
				}
				if (hitBoat.direction == 'down') {
					if (this.battleship.isInGrid([first[0] - 1, first[1]])) {
						this.hitCoordinates.push([first[0] - 1, first[1]]);
					}
					if (this.battleship.isInGrid([last[0] + 1, last[1]])) {
						this.hitCoordinates.push([last[0] + 1, last[1]]);
					}
					for (coordinates of hitBoat.coordinatesList) {
						if (this.battleship.isInGrid([coordinates[0], coordinates[1] + 1])) {
							this.hitCoordinates.push([coordinates[0], coordinates[1] + 1]);
						}
						if (this.battleship.isInGrid([coordinates[0], coordinates[1] - 1])) {
							this.hitCoordinates.push([coordinates[0], coordinates[1] - 1]);
						}
					}
				}
				this.evaluateArray(this.hitCoordinates, enemyPlayer);

				// Reinitialiser hitcoordinates
				this.hitCoordinates = [];
			}
		}

		// sinon évaluer la nouvelle liste
		else {
			// attaquer
			this.battleship.attackEnemy(attack_coordinates, enemyPlayer);
			this.evaluateArray([[x,y]], enemyPlayer);
		}

		this.evaluateSubArray();
	};
  
  this.quitGame = function() {
    this.game = null;
  }


}



module.exports = AI;


//création d'une liste 
function createArray(n) {
	var array = [];
	for (i=0; i<n; i++) {
		for (j=0; j<n; j++) {
			array.push([i,j]);
		}
	}
	return array;
};