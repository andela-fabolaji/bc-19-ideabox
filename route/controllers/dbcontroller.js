var mysql = require('mysql');

var DbHandler = function () {
  this.connection = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'password',
    database: 'ideabox',
    connectionLimit: 100
  });

  this.resHandler = {};

  this.insertQuery = function (table, dataSet, res) {
    this.resHandler = res;

    var query = 'Insert into ' + table + ' (';
    var isStartingPoint = true;
    for (var key in dataSet) {
      if (!isStartingPoint) {
        query += ' ,';
      }
      isStartingPoint = false;
      query += key;
    } 
    query += ') VALUES (';
    isStartingPoint = true;
    for (var key in dataSet) {
      if (!isStartingPoint) {
        query += ' ,';
      }
      isStartingPoint = false;
      query += "'" + dataSet[key] + "'";;
    } 
    query += ')';
    this.executeQuery(query);
  }

  this.signin = function (details, response) {
    var query = "SELECT * FROM users WHERE email = '" + details.email + "'";
    this.connection.getConnection(function(err, connection) {
      
      connection.query(query, function (err, res) {
        if (!err) {
          if(res.length === 0){
            response.json({status:false, msg: 'User does not exist!'});  
          } else {
            if (res[0].password === details.password) {
              response.json({status:true, msg: 'Welcome!'});
            } else {
              response.json({status:false, msg: 'Invalid password'});
            }
          }
        } else {
          response.json({status:false, msg: 'Unable to establish connection!'});
        }
        response.end();
      });
      connection.release();  
    });

  };

  this.executeQuery = function (query) {
    var instance = this;
    this.connection.getConnection(function (err, connection) {
      connection.query(query, function(err, result) {
        if (!err) {
          instance.resHandler.send('1');
        } else {
          instance.resHandler.send('0');
        }
        instance.resHandler.end();
      });
      connection.release();
    });
  };

};

module.exports = DbHandler;