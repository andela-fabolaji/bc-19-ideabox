var mysql = require('mysql');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt-nodejs');

var hash = bcrypt.hashSync("femi");

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
      if (key === 'password') {
        dataSet[key] = bcrypt.hashSync(dataSet[key]);
      }
      query += "'" + dataSet[key] + "'";;
    } 
    query += ')';
    return query;
    //this.executeQuery(query);
  }

  this.signin = function (details, response) {
    var query = "SELECT * FROM users WHERE email = '" + details.email + "'";
    this.connection.getConnection(function(err, connection) {
      
      connection.query(query, function (err, res) {
        if (!err) {
          if(res.length === 0){
            response.json({status:false, msg: 'User does not exist!'});  
          } else {
            if (bcrypt.compareSync(details.password, res[0].password)) {
              var token = jwt.sign({id:res[0].id}, 'key', {expiresIn: '24h'});
              response.json({status:true, msg: 'Welcome!', authtoken:token});
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

  this.register = function(details, response) {
    var query = this.insertQuery('users', details,response);
    this.connection.getConnection(function(err, connection) {
      
      connection.query(query, function (err, res) {
        if(err) {
          response.json({status:false, msg:'This email already exists'})
        } else {
          var token = jwt.sign({id:res.id}, 'key', {expiresIn: '24h'});
          response.json({status:true, msg: 'Registration successfull', authtoken:token});
        }
        response.end();
    });
      connection.release();
  });
}
  this.executeQuery = function (query) {
    var instance = this;
    this.connection.getConnection(function (err, connection) {
      connection.query(query, function (err, result) {
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

  this.getQueryData = function(query, response) {
    this.connection.getConnection(function (err, connection) {
      connection.query(query, function (err, result) {
        response.json(result);
        response.end();
      });
      connection.release();
    });
  }

  this.getIdeas = function (response) {
    var sorter = 'date';
    var query = 'SELECT *, ideas.id AS ideaId FROM ideas, users WHERE users.id = users_id ORDER BY ' + this.connection.escapeId('ideas.' + sorter) + ' DESC';
    this.connection.getConnection(function (err, connection) {
      connection.query(query, function (err, result) {
        if (!err) {
          if (result.length != 0) {
            response.json(result);
          } else {
            response.json({status: false, msg: 'There are no ideas now'});
          }
        } else {
          response.json({
            status: false,
            msg: 'Unable to secure connection, please try again'
          });
        }
        response.end()
      });
    });
  };

  this.getComments = function (response) {
    var sorter = 'comment_date_time';
    var query = 'SELECT * FROM comments '
  };

};

module.exports = DbHandler;