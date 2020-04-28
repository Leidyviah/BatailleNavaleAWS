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
  conn=db.getConnexionDb();
  let sql = "select p.id,j1.username as gagnant,j2.username as perdu,p.score_g, p.score_p from parties p join joueurs j1 on j1.id=p.id_gagnant join joueurs j2 on j2.id=p.id_perdu where p.id_gagnant = ? OR p.id_perdu = ? ";
  let query = conn.query(sql, [req.session.ID,req.session.ID], (err, results) => {
    console.log('id test parties:',req.session.ID);
    if(err) throw err;
    res.render('parties',{
      results: results
    });
    res.end();
  });
});
module.exports = router;
