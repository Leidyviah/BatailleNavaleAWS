var express = require('express');
var gameServer = require('../server.js').gameServer;
var io = require('../server.js').io;
var db = require("../jeu/connexion_db.js");
var ejs = require('ejs');
var sha256 = require('js-sha256');
var ent = require('ent');
var conn=db.getConnexionDb();

var router = express.Router(); 


router.get('/', function(req, res)  {
 if(req.session.loggedin) {
  conn=db.getConnexionDb();
  let sql = "select * from parties where player_one = ? or player_two = ? ";
  let query = conn.query(sql, [req.session.username,req.session.username], (err, results) => {
    //console.log('id test parties:',req.session.username);
    if(err) throw err;
    res.render('parties',{results: results});
    res.end();
  });
}else
   {
   	res.render('/');
	
 }
});
module.exports = router;
