var db = require("../jeu/connexion_db.js");
var conn=db.getConnexionDb();
exports.save =function(req, res) {
  if(req.body.password==req.body.password2){
  let data = {email: req.body.email, username: req.body.username, fullname: req.body.fullname,password: req.body.password};
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
exports.auth = function(request, response) {
    var username = request.body.username;
    var password = request.body.password;
    if (username && password) {
        conn.query('SELECT * FROM joueurs WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            if (results.length > 0) {
                request.session.loggedin = true;
                request.session.ID = results.id;
                request.session.username = username;
                response.redirect('/joueurs');
            } else {
                response.send('Le nom d\'utilisateur! ou/et le mots de passe incorrect(s)');
            }           
            response.end();
        });
    } else {
        response.send('Veuillez ajouter votre nom d\'utilisateur et votre mots de passe !');
        response.end();
    }
};
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
  let sql = "select p.id,j1.username as gagnant,j2.username as perdu,p.score_g, p.score_p from parties p join joueurs j1 on j1.id=p.id_gagnant join joueurs j2 on j2.id=p.id_perdu";
  let query = conn.query(sql, (err, results) => {
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
exports.logout=function(req,res,next){
  req.session.loggedin=false;
  res.redirect('/loginn');
};