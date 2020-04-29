
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
    //var username = request.body.username;
    //var password = request.body.password;
    var username = ent.encode(request.body.username);
    var password = ent.encode(request.body.password);
    if (username && password) {
    var grain ;
    //response.send({message: username});
    conn.query('SELECT * FROM joueurs WHERE username = ?', [username], function(error, results, fields) {
            if(error) throw error;
            if (results.length > 0) {
              
              console.log('grain:',results[0].grain);
              console.log('grain:',results[0]);
              
                //response.send({message: results[0].grain});
                //response.end();
                grain = results[0].grain;

                //on  hash le mots de passe entre par l'utilisateur 
               let passHacher=sha256(password+grain);
               console.log('passHacher:',passHacher);
               conn.query('SELECT * FROM joueurs WHERE username = ? AND password = ?', [username, passHacher], function(error2, results2, fields2) {
                      console.log('res',results2);
                      console.log('res',results2.length);
                      if (results2.length > 0) {
                        console.log(results2);
                          request.session.loggedin = true;
                          request.session.ID = results2.id;
                          request.session.username = username;
                          request.session.save();
                          response.render('welcome');
                          response.end();
                      } else {
                          response.render('loginn',{message:'Usernmae and/or password is incorrect'});
                          //response.send({message: grain});
                          //response.send({message: username});

                          
                          response.end();
                      }           
                      
                  });
               //response.send({message: grain});
               //response.end();
                                              } else {
                          response.render('loginn',{message:'Usernmae and/or password is incorrect'});
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