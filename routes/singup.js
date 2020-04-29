
var express = require('express');
var gameServer = require('../server.js').gameServer;
var io = require('../server.js').io;
var db = require("../jeu/connexion_db.js");
var ejs = require('ejs');
var sha256 = require('js-sha256');
var ent = require('ent');
var conn=db.getConnexionDb();

var router = express.Router(); 

function strRandom(o) {
  var a = 10,
      b = 'abcdefghijklmnopqrstuvwxyz',
      c = '',
      d = 0,
      e = ''+b;
  if (o) {
    if (o.startsWithLowerCase) {
      c = b[Math.floor(Math.random() * b.length)];
      d = 1;
    }
    if (o.length) {
      a = o.length;
    }
    if (o.includeUpperCase) {
      e += b.toUpperCase();
    }
    if (o.includeNumbers) {
      e += '1234567890';
    }
  }
  for (; d < a; d++) {
    c += e[Math.floor(Math.random() * e.length)];
  }
  return c;
}



router.post('/', function(req, res) {
  if(req.body.password==req.body.password2){
  let username = ent.encode(req.body.username);
  conn.query('SELECT * FROM joueurs WHERE username = ?', [username], function(error, results, fields) {
            if(error) throw error;
            if (results.length < 1) {
  
  let pass = ent.encode(req.body.password);
  let grain = strRandom({includeUpperCase: true, includeNumbers: true, length: 10, startsWithLowerCase: true});
  let passHacher= sha256(pass+grain);
  let data = {email: req.body.email, username: username, fullname: req.body.fullname,password: passHacher,grain: grain};
  let sql = "INSERT INTO joueurs SET ?";
  let query = conn.query(sql, data,(err, results) => {
    if(err) throw err;
    res.render('loginn',{messagee:'Singing up succes'});
     res.end();
  });}
  else{
    res.render('insc',{message:'Username already exist'});
    res.end();
  }
});
  }else {
res.render('insc',{message:'Confirmation  incorrect! Please verify your password and confirmation password '});
res.end();
  }
});


module.exports = router;