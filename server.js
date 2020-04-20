
var express = require('express'); 
var path = require('path'); 
var http = require('http'); // http pour socket.io
var socket = require('socket.io'); // Communication client serveur
var ejs = require('ejs');
var bodyParser = require('body-parser'); 
var cookieParser = require('cookie-parser');
var sharedsession = require("express-socket.io-session")

//A relire  la doc pour mieux comprendre
var session = require("express-session")({
  secret: "ZEHIU5348TQG8VT4VUJEZYSY483YA",
  resave: true,
  saveUninitialized: true
}); 


var gameServer = require('./jeu/gameServer.js');

/**************************************************************************INITIALISATION**************************/

var app = express();

var server = http.createServer(app);//création du serveur 


app.use(session); 
app.use(cookieParser()); 



var port = 8080; 



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));





app.use(express.static('static'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.set('views', path.join(__dirname,'views'));//pour les templates
app.set('view engine', 'ejs');


var gameServer = new gameServer();//explicite

/******************************* SOCKETS********************************************************************************/

var io = socket(server);


io.use(sharedsession(session, {
    autoSave:true 
}));




var ClientServer = require('./jeu/clientServer.js');
var clientServer = new ClientServer(gameServer, io);
clientServer.init();


//pour pouvoir les utiliser dans les fichier js
module.exports = {
	server: server,
	io: io,
	gameServer: gameServer,
	clientServer: clientServer,
};

/***************************** ROUTES *****************************************************************************************/
var insc = require('./routes/insc');
app.use('/insc', insc);
var initialization = require('./routes/initialization');
app.use('/initialization', initialization);
var join = require('./routes/join');
app.use('/join', join);
var createGame = require('./routes/createGame');
app.use('/createGame', createGame);
var game = require('./routes/game');
app.use('/game', game);
var setBoats = require('./routes/setBoats');
app.use('/setBoats', setBoats);
var solo = require('./routes/solo');
app.use('/solo', solo);
var logout = require('./routes/logout');
app.use('/logout', logout);
var joeur = require('./routes/joueurs');
app.use('/joueurs', joeur);
var partie = require('./routes/parties');
app.use('/parties', partie);


/*******************ROUTE PRINCIPALE***************************/
app.get('/', function(req, res) {
	var correctRoute = gameServer.sendRoute(req.session.username);
	if (correctRoute == '/') {
	 	res.render('welcome');
	 }
	 else {
	 	res.redirect(correctRoute);
	 }
});


//app
const listener = server.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

//en écoute
//server.listen(port);

