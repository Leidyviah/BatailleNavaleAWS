var db = require("../jeu/connexion_db.js");
var ejs = require('ejs');
var sha256 = require('js-sha256');
var ent = require('ent');
var conn=db.getConnexionDb();
//s'inscrire (inserer un nouveau joueur)
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

//
exports.save =function(req, res) {
  if(req.body.password==req.body.password2){
    let username = ent.encode(req.body.username);
  let pass = ent.encode(req.body.password);
  let grain = strRandom({includeUpperCase: true, includeNumbers: true, length: 10, startsWithLowerCase: true});
  let passHacher= sha256(pass+grain);
  let data = {email: req.body.email, username: username, fullname: req.body.fullname,password: passHacher,grain: grain};
  let sql = "INSERT INTO joueurs SET ?";
  let query = conn.query(sql, data,(err, results) => {
    if(err) throw err;
    res.redirect('/loginn');
     res.end();
  });
  }else {
res.redirect('/insc');
res.end();
  }
};

//un champ 
//pour se conncter au jeu
exports.auth = function(request, response) {
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
                          response.send('!!Le nom d\'utilisateur! ou/et le mots de passe incorrect(s)');
                          //response.send({message: grain});
                          //response.send({message: username});

                          
                          response.end();
                      }           
                      
                  });
               //response.send({message: grain});
               //response.end();
                                              } else {
                          response.send('Le nom d\'utilisateur! ou/et le mots de passe incorrect(s)');
                          response.end();
                      }           
                      
                  });
             }
            else {
                  response.send('Veuillez ajouter votre nom d\'utilisateur et votre mots de passe !');
                  response.end();
              }
              
    
};
// liste des autres joueurs
exports.list = function(req, res)  {

  let sql = "SELECT * FROM joueurs";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.render('joueurs',{
      results: results
    });
    res.end();
  });
};
// liste parties 


exports.parties = function(req, res)  {
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
};
//parties perdu
exports.partiesp = function(req, res)  {
  conn=db.getConnexionDb();
  let sql = "select p.id,j1.username as gagnant,j2.username as perdu,p.score_g, p.score_p from parties p join joueurs j1 on j1.id=p.id_gagnant join joueurs j2 on j2.id=p.id_perdu where p.id_gagnant =? ";
  let query = conn.query(sql, [req.session.ID], (err, results) => {
    if(err) throw err;
    res.render('parties',{
      results: results
    });
    res.end();
  });
};

//sauvegarder une partie

exports.sauv = function(req, res) {
  
  let data = {id: req.query.id, id_gagnant: req.query.id_gagnant, id_perdu: req.query.id_perdu,score_g: req.query.score_g,score_p: req.query.score_p};
  let sql = "INSERT INTO parties SET ?";
  let query = conn.query(sql, data,(err, results) => {
    if(err) throw err;
    res.render('parties',{
      results: results
    });
    res.end();
  });
};
//se deconnceter
exports.logout=function(req,res,next){
  req.session.loggedin=false;
  res.redirect('/loginn');
};