
var express = require('express');
var gameServer = require('../server.js').gameServer;
var io = require('../server.js').io;
var db = require("../jeu/connexion_db.js");
var ejs = require('ejs');
var sha256 = require('js-sha256');
var ent = require('ent');
var conn=db.getConnexionDb();

var router = express.Router(); 




router.post('/', function(request, response) {
  //ça pertmet d'encoder les données de connexion entrés par l'utilisateur username & password
    var username = ent.encode(request.body.username);
    var password = ent.encode(request.body.password);
    if (username && password) { // on test si l'utilisateur à entrer ses données
    var grain ;
    //cette requette permet de recuperer le grain pour qu'on peut chiffrer le mots passe entré par l'utilisateur
    conn.query('SELECT * FROM joueurs WHERE username = ?', [username], function(error, results, fields) {
            if(error) throw error;
            if (results.length > 0) {//le cas au le username exist
              
              console.log('grain:',results[0].grain);
              console.log('grain:',results[0]);

                grain = results[0].grain;
                //on  hash le mots de passe entre par l'utilisateur 
               let passHacher=sha256(password+grain);
               console.log('passHacher:',passHacher);
               //maintenant on recupere le password et on teste si il est correcte
               conn.query('SELECT * FROM joueurs WHERE username = ? AND password = ?', [username, passHacher], function(error2, results2, fields2) {
                      console.log('res',results2);
                      console.log('res',results2.length);
                      if (results2.length > 0) {
                        console.log(results2);
                          request.session.loggedin = true;
                          request.session.ID = results2.id;
                          request.session.username = username;
                          request.session.save();
                          gameServer.newPlayer(username);
                          response.redirect("/");
                          //response.render('welcome');
                          response.end();
                      } else {
                          response.render('loginn',{message:'Username and/or password is incorrect'});

                          
                          response.end();
                      }           
                      
                  });

                } else {
                          response.render('loginn',{message:'Username and/or password is incorrect'});
                          response.end();
                }           
                      
                  });
             }
            else {
                  response.render('loginn',{message:'Enter your username and your password'});
                  response.end();
              }
              
    
});


module.exports = router;