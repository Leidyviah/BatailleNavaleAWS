function boat (name, size) {


	this.name = name;
	this.size = size;
	this.isSunk = false;
	this.coordinates = [0,0];//Coordonnées de la première case
	this.isSet = false;
	this.direction = 'right';//Position du bateau (right ou down)
	this.coordinatesList = new Array(this.size).fill([0,0]); //liste des coordonées du bateau


	this.sink = function() {
		this.isSunk = true;
	}


	this.setPosition = function (initial_coordinates, direction) {
		this.coordinates = initial_coordinates;
		this.direction = direction;
	};


	//Remplie la liste des coordonnées du bateau
	this.setCoordinatesList = function() {		

        this.coordinatesList[0] = this.coordinates;

        switch (this.direction) {

            case 'right':
                for (var i=0; i<this.size; i++) {
                    this.coordinatesList[i] = [this.coordinates[0], this.coordinates[1] + i];
                }
                break;

            case 'down':
                for (var i=0; i<this.size; i++) {
                    this.coordinatesList[i] = [this.coordinates[0] + i, this.coordinates[1]];
                }
                break;
        }
	};

};

module.exports = boat;