
var express = require('express'); 
var path = require('path'); 
var http = require('http'); // http pour socket.io
var socket = require('socket.io'); // Communication client serveur
var ejs = require('ejs');
var bodyParser = require('body-parser'); 
var cookieParser = require('cookie-parser');
var sharedsession = require("express-socket.io-session")
var cookieSession = require('cookie-session');

var gameServer = require('./jeu/gameServer.js');

/**************************************************************************INITIALISATION**************************/
//A relire  la doc pour mieux comprendre
var session = require("express-session")({
  secret: "ZEHIU5348TQG8VT4VUJEZYSY483YA",
  resave: true,
  saveUninitialized: true
}); 

var app = express();

app.use(session); 
var server = http.createServer(app);//création du serveur 



app.use(cookieParser()); 



var port = 8080; 



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.use(express.static('static'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.set('views', path.join(__dirname,'views'));//pour les templates
app.set('view engine', 'ejs');


//database

var db = require("./jeu/connexion_db.js");

//var conn=db.getConnexionDb();

/******************************* SOCKETS********************************************************************************/

var io = socket(server);


io.use(sharedsession(session, {
    autoSave:true 
}));


var gameServer = new gameServer(io);//explicite

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
var quit = require('./routes/quit');
app.use('/quit', quit);
var login = require('./routes/loginn');
app.use('/loginn', login);
var auth = require('./routes/auth');
app.use('/auth', auth);
var parties = require('./routes/parties');
app.use('/parties', parties);
var joueurs = require('./routes/joueurs');
app.use('/joueurs', joueurs);
var save = require('./routes/singup');
app.use('/save', save);
/*
var partie = require('./routes/parties');
app.use('/parties', partie);*/
//app.get('/', routes.index);
//var db_route = require('./routes/request_db');//inclure les routes des fonctions dans request_db
//app.get('/joueurs', db_route.list);//la lsite des jpueurs

//app.get('/parties', db_route.parties);//pour afficher les parties
//app.post('/auth', db_route.auth);//pour s'authentifier
//app.get('/sauv',db_route.sauv);//pour sauvgarder une partie
//app.post('/save',db_route.save);//pour ejouter un nouveau joueur
/*******************ROUTE PRINCIPALE***************************/
app.get('/', function(req, res) {
	var correctRoute = gameServer.sendRoute(req.session.username);
	//je teste si le joueur est deja connceter ou pas 
	//if (req.session.loggedin) {

	if (correctRoute == '/') {
	 	res.render('welcome', {loggedIn: req.session.loggedin,
                          username: req.session.username});
	 }
	 else {
	 	res.redirect(correctRoute);
	 }
	 
});

//

//on ecote app
const listener = server.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

//en écoute
//server.listen(port);

module.exports = app; 