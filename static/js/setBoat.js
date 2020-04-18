Vue.http.options.emulateJSON = true;

var socket = io.connect();


var boats = new Vue({//vue contenant la grille de jeu

    el: "#boats",



    data: {
        battleship: {grid: []},
        errors: [],
    },


    /********************************LA MAJORITE DES METHODES ONT DEJA ETE IMPLEMENTEES AVANT DANS IA.JS***********************/
    created: function() {
        this.$http.get('/setBoats/getBoats').then(function(response) {
            console.log(response);
            this.battleship = response.body.battleship;
        }), function(response) {
            console.log(response);
        };


        $(document).ready(function() {//j'ai rajouté ça pour ^que le drag and drop marche sur fireforx car sur chrome ça ne marche pas toujours (je ne sais pas pourquoi)
            window.setTimeout(boats.initializeDragAndDrop, 500);
        });

        socket.on('logout', function(response) {
            window.location.href = '/logout';
        });
    },


    methods: {
        //double clic pour retourner les bateau
        rotate: function(boat_name) {

            if (this.battleship.boats[boat_name].isSet) {
                this.reset(boat_name);
                this.errors.push('lebateau est déjà placé, impossible de le retourner sur la grille');
            }
            else {
                $('#' + boat_name).toggleClass('rotated');

                var direction = this.battleship.boats[boat_name].direction;

                if (direction == 'down') {
                    this.battleship.boats[boat_name].direction = 'right';
                }
                else {
                    this.battleship.boats[boat_name].direction = 'down';
                }
            }
        },




        //retour à la position initiale
        reset: function(boat_name) {
            var boat = $('#' + boat_name);
            boat.animate({
                "left": 0,
                "top": 0,
            });
            this.setBoatOffGrid(boat_name);
        },

            /*****************************************DRAG AND DROP A METTRE ICI*************************************/

        //DRAG
        makeDraggable: function() {
            $('.draggable').draggable({
                containment : 'document',
                snap: '.case',
                snapMode: 'inner',
                revert : 'invalid',
            });
        },

        //DROP
        makeDroppable: function() {
            $('body').droppable({

                drop: function(event, ui) {

                    var pos_left = ui.offset.left;               
                    var pos_top = ui.offset.top;
                    var boat_name = ui.draggable.attr('id');
                    var direction = boats.battleship.boats[boat_name].direction;

                    if (boats.battleship.boats[boat_name].isSet) {

                        boats.setBoatOffGrid(boat_name);

                    }

                    var errors = boats.isBoatPositionNotValid(boat_name, pos_left, pos_top, direction);

                    if (errors) {
                        ui.draggable.draggable('option','revert', function(event, ui) {
                                                                    $(this).data("uiDraggable").originalPosition = {
                                                                        top: 0,
                                                                        left: 0,
                                                                    };
                                                                    return true;
                                                                });
                        boats.errors = errors;
                    }
                    else {
                        ui.draggable.draggable('option','revert','invalid');


                        boats.errors = [];//remet à zéro le nombre d'erreur

                        //drag le bateau sur la grille
                        boats.setBoatOnGrid(boat_name);
                    }
                }
            });
        },

        //DRAG AND DROP
        initializeDragAndDrop: function() {
            this.makeDraggable();
            this.makeDroppable();
        },


        findCase: function(left, top) {

            for (var i = 1; i <= this.battleship.grid.length; i++) { // ERREUR ICI A ARRANGER
                var pos_top = $("#myGrid > .divTableBody > .divTableRow[value='" + i + "']").offset().top;
                if (pos_top == top) {
                    break;
                }
            }

            var k = Math.min(i, 10); 

            for (var j = 1; j <= this.battleship.grid.length; j++) { 

                var pos_left = $("#myGrid > .divTableBody > .divTableRow[value='" + k + "'] > .divTableCell[value='" + j + "']").offset().left;

                if (pos_left == left) {
                    break;
                }
            }

            return [i-1, j-1]; // If j-1

        },

        //explicite
        isBoatPositionNotValid: function(boat_name, left, top, direction) {
            var errors = [];

            var coordinates = this.findCase(left, top);

            var boat = this.battleship.boats[boat_name];
            
            this.setBoatPosition(boat_name, coordinates, direction);

            this.setBoatCoordinatesList(boat_name);


            for (var i = 0; i < boat.coordinatesList.length; i++) {

                if (!this.isInGrid(boat.coordinatesList[i])) {
                    errors.push(boat.name + ' you have to drag it perfectely !'); //SUR CHROME CA MARCHE RAREMENT
                    break;
                }

                if (!this.isZoneAvailable(boat.coordinatesList[i])) {
                    errors.push('Zone error, ' + boat.name + ' is too close to another boat!');
                    break;
                }
            }
            if (errors.length == 0) {
                return false;
            }
            return errors;
        },

        
        setBoatPosition: function(boat_name, initial_coordinates, direction) {
            this.battleship.boats[boat_name].coordinates = initial_coordinates;
            this.battleship.boats[boat_name].direction = direction;
        },

       


        setBoatCoordinatesList: function(boat_name) {

            var boat = this.battleship.boats[boat_name];
            boat.coordinatesList[0] = boat.coordinates;

            switch (boat.direction) {

                case 'down':
                    for (var i = 0; i < boat.size; i++) {
                        boat.coordinatesList[i] = [boat.coordinates[0] + i, boat.coordinates[1]];
                    }
                    break;
                case 'right':
                    for (var i = 0; i < boat.size; i++) {
                        boat.coordinatesList[i] = [boat.coordinates[0], boat.coordinates[1] + i];
                    }
                    break;
            }
        },


        isInGrid: function(coordinates) {
            if (Math.min(9, Math.max(coordinates[0],0)) != coordinates[0] ) {
                return false;
            }
            if (Math.min(9, Math.max(coordinates[1],0)) != coordinates[1] ) {
                return false;
            }
            return true;
        },

        
        isZoneAvailable: function(coordinates) {
            var x = coordinates[0];
            var y = coordinates[1];

            for (var i = x-1; i <= x+1; i++) {
                for (var j = y-1; j <= y+1; j++) {
                    if (i>=0 && i<=9 && j>=0 && j<=9) {
                        if (this.battleship.grid[i][j] != 0) {
                            return false;
                        }
                    }
                }
            }
            return true;
        },

       
        setBoatOnGrid: function(boat_name) {
            var boat = this.battleship.boats[boat_name];
            for (var i = 0; i < boat.size; i++) {
                this.battleship.grid[boat.coordinatesList[i][0]][boat.coordinatesList[i][1]] = 1;
            }
            boat.isSet = true;
        },

        setBoatOffGrid: function(boat_name) {
            var boat = this.battleship.boats[boat_name];
            for (var i = 0; i < boat.size; i++) {
                this.battleship.grid[boat.coordinatesList[i][0]][boat.coordinatesList[i][1]] = 0;
            }
            boat.isSet = false;
        },

        areBoatsSet: function() {
            for (var boat in this.battleship.boats) {
                if (!this.battleship.boats[boat].isSet) {
                    return false;
                }
            }
            return true;
        },


        submitBoats: function(event) {
            if (!this.areBoatsSet()) {
                this.errors.push("You have to set all boats or press the \"random button\" FIRST !");
            }

            else {

                this.$http.post('/setBoats/sendBoats', {boats: this.battleship.boats}).then(function(response) {
                    window.location.href = response.data.redirect;
                }), function(response) {
                };
            }
        },

        randomSetAndSubmitBoats: function(event) {
            this.$http.post('/setBoats/sendBoats', {randomSet: true}).then(function(response) {
                window.location.href = response.data.redirect;
            }), function(response) {
            };
        },
    },
});
