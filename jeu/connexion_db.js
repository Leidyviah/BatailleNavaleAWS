

// j'ai utiliser cette solution parce que le serveur se ferme à chaque fois donc je perds la connexion ç la base de données
module.exports={

getConnexionDb:function(){

 	console.log('Get connection ...');
 	var mysql = require('mysql');
  //les informations sur la base de données
 var db_config = {
    host: 'us-cdbr-iron-east-01.cleardb.net',
    user: 'b8b2cd6a0717d0',
    password: '7430245a',
    database: 'heroku_1ad342f3e6afa29'
};
var db_config2={
  connectionLimit : 1000, //important
    host     : 'us-cdbr-iron-east-01.cleardb.net',
    user     : 'b8b2cd6a0717d0',
    password : '7430245a',
    database : 'heroku_1ad342f3e6afa29',
    debug    :  false
};

var connection;
var pool
function handleDisconnect() {
  //connection = mysql.createConnection(db_config); // recrée la connexion tanqte que la premiere est fermee
   pool = mysql.createPool(db_config2);
  pool.getConnection(function(err,connection){
        if (err) {
          console.log('error when connecting to db:', err);
          setTimeout(handleDisconnect, 2000); 
        }else{
           console.log('your r connecting:');
        }
        }); 
  /*connection.connect(function(err) {              // le serveur est ferme ou relance
    if(err) {                                  
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // on declare un temps d'attends pour  se connceter encore fois,
    } else{
    	

    }
  });      */                               
             
  pool.on('connection', function (connection) {
    if (connection) {
      console.log('Connected the database via threadId %d:', connection.threadId);
        connection.query('SET SESSION auto_increment_increment=1');
    }
});                             
  pool.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
      handleDisconnect();                         
    } else {
      throw err;                                  
    }
  });
}

handleDisconnect();
return pool;
}};


/*
mysql://b8b2cd6a0717d0:7430245a@us-cdbr-iron-east-01.cleardb.net/heroku_1ad342f3e6afa29?reconnect=true
mysql --host=us-cdbr-iron-east-01.cleardb.net --user=b8b2cd6a0717d0 --password=7430245a --reconnect heroku_1ad342f3e6afa29
 ALTER TABLE joueurs ALTER COLUMN password varchar(255);
 ALTER TABLE joueurs
  MODIFY grain varchar(255) NOT NULL;
CREATE TABLE IF NOT EXISTS `joueurs` (
  id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  email varchar(255) NOT NULL,
  username varchar(255) NOT NULL,
  fullname varchar(255) NOT NULL,
  password  char(40) character set ascii NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `parties` (
  id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  player_one varchar(255) NOT NULL,
  player_two varchar(255) NOT NULL,
  isia varchar(2) NOT NULL
  

) ENGINE=InnoDB DEFAULT CHARSET=utf8;


select p.id,j1.username as gagant,j2.username as perdu,p.score_g, p.score_p
from parties p 
join joueurs j1 
on j1.id=p.id_gagnant 
join joueurs j2 
on j2.id=p.id_perdu
where p.id_gagnant=1;
select p.id,j1.username as gagant,j2.username as perdu,p.score_g, p.score_p
from parties p 
join joueurs j1 
on j1.id=p.id_gagnant 
join joueurs j2 
on j2.id=p.id_perdu
where p.id_perdu=1 or  p.id_gagnant=1 ;
*/
 