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

  let sql = "SELECT * FROM joueurs";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.render('joueurs',{
      results: results
    });
    res.end();
  });
});

module.exports = router;