

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

var connection;

function handleDisconnect() {
  connection = mysql.createConnection(db_config); // recrée la connexion tanqte que la premiere est fermee

  connection.connect(function(err) {              // le serveur est ferme ou relance
    if(err) {                                  
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // on declare un temps d'attends pour  se connceter encore fois,
    } else{
    	

    }                                    
  });                                     
                                          
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
      handleDisconnect();                         
    } else {                                      
      throw err;                                  
    }
  });
}

handleDisconnect();
return connection;
}};


/*
mysql://b8b2cd6a0717d0:7430245a@us-cdbr-iron-east-01.cleardb.net/heroku_1ad342f3e6afa29?reconnect=true
mysql --host=us-cdbr-iron-east-01.cleardb.net --user=b8b2cd6a0717d0 --password=7430245a --reconnect heroku_1ad342f3e6afa29

CREATE TABLE IF NOT EXISTS `joueurs` (
  id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  email varchar(255) NOT NULL,
  username varchar(255) NOT NULL,
  fullname varchar(255) NOT NULL,
  password  char(40) character set ascii NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `parties` (
  id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  id_gagnant int(11) NOT NULL,
  id_perdu int(11) NOT NULL,
  score_g int(11) NOT NULL,
  score_p int(11) NOT NULL,
  CONSTRAINT FK_gagnant FOREIGN KEY (id_gagnant)
    REFERENCES joueurs(id),
   CONSTRAINT FK_perdu FOREIGN KEY (id_perdu)
  REFERENCES joueurs(id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8;


select p.id,j1.username as gagant,j2.username as perdu,p.score_g, p.score_p
from parties p 
join joueurs j1 
on j1.id=p.id_gagnant 
join joueurs j2 
on j2.id=p.id_perdu;

*/
 