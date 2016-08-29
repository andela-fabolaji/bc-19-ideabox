var mysql = require('mysql');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt-nodejs');


/**
 *
 * DbHandler class
 *
 */
var DbHandler = function () {
  this.connection = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'password',
    database: 'ideabox',
    connectionLimit: 100
  });
  this.resHandler = {};

 /**
  * Generic method to insert query into database
  *
  * @param {string} table
  * @param {object} dataSet
  * @param {object} response
  *
  */
  this.insertQuery = function ( table, dataSet, res ) {
    this.resHandler = res;
    var query = 'Insert into ' + table + ' (';
    var isStartingPoint = true;

    for ( var key in dataSet ) {
      if ( !isStartingPoint ) {
        query += ' ,';
      }
      isStartingPoint = false;
      query += key;
    }
    query += ') VALUES (';
    isStartingPoint = true;
    for ( var key in dataSet ) {
      if ( !isStartingPoint ) {
        query += ', ';
      }
      isStartingPoint = false;
      if ( key === 'password' ) {
        dataSet[key] = bcrypt.hashSync( dataSet[key] );
      }
      query += mysql.escape(dataSet[key]);
    }
    query += ')';

    return query;
  }

  /**
   *
   * Method to handle signin process
   *
   * @param {object} details
   * @param {object} response
   *
   */
  this.signin = function ( details, response ) {
    var query = "SELECT * FROM users WHERE email = '" + details.email + "'";
    this.connection.getConnection(function ( err, connection ) {
      connection.query( query, function ( err, res ) {
        if (!err ) {
          if( res.length === 0 ){
            response.json({status:false, msg: 'User does not exist!'});
          } else {
            if ( bcrypt.compareSync( details.password, res[0].password ) ) {
              var token = jwt.sign({id:res[0].id}, 'key', {expiresIn: '24h'});
              response.json({status:true, msg: 'Welcome!', authtoken:token, 'fullname':res[0].lastname + " " + res[0].firstname});
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

  /**
   *
   * Method to handle user Registration
   *
   * @param {object} details
   * @param {object} response
   *
   */
  this.register = function ( details, response ) {
    var query = this.insertQuery('users', details,response);
    this.connection.getConnection(function ( err, connection ) {
      connection.query(query, function ( err, res ) {
        if( err ) {
          console.log(err);
          response.json({status:false, msg:'This email already exists'})
        } else {
          var token = jwt.sign({id:res.id}, 'key', {expiresIn: '24h'});
          response.json({status:true, msg: 'Registration successfull', authtoken: token, 'fullname':details.lastname+" "+details.firstname});
        }
        response.end();
      });
      connection.release();
    });
  }

  /**
   *
   * Query handler: Executes query
   *
   * @param {string} query
   *
   */
  this.executeQuery = function ( query ) {
    var instance = this;
    this.connection.getConnection(function ( err, connection ) {
      connection.query(query, function ( err, result ) {
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

  /**
   *
   * Method returns the result of a query
   *
   * @param {string} query
   * @param {object} response
   *
   */
  this.getQueryData = function ( query, response ) {
    this.connection.getConnection( function ( err, connection ) {
      connection.query(query, function ( err, result ) {
        response.json(result);
        response.end();
      });
      connection.release();
    });
  }

  /**
   *
   * Method to get all fetch all ideas
   *
   * @param {object} response
   *
   */
  this.getIdeas = function ( response ) {
    var sorter = 'date';
    var query = 'SELECT *, ideas.id AS ideaId, SUM(votes.upvotes) AS upvotes, SUM(votes.downvotes) AS downvotes FROM ideas INNER JOIN users on users.id = users_id LEFT JOIN votes ON ideas.id = ideas_id GROUP BY ideas.id ORDER BY ' + this.connection.escapeId('ideas.' + sorter) + ' DESC';

    this.connection.getConnection(function ( err, connection ) {
      connection.query(query, function ( err, result ) {
        if ( !err ) {
            var trendingq = "SELECT *, LEFT(idea_desc, 100) AS idea_desc, ideas.id AS ideaId, (SUM(votes.upvotes) - SUM(votes.downvotes)) AS relevance FROM ideas LEFT JOIN votes ON ideas.id = ideas_id GROUP BY ideas.id ORDER BY relevance DESC LIMIT 3";
            connection.query(trendingq, function(err, trending) {
              if(!err) {
                response.send({ideas:result, trends:trending});
              }
          });
        } else {
          response.json({
            status: false,
            msg: 'Unable to secure connection, please try again'
          });
        }
      });
    });
  };

  /**
   *
   * Method for handling votes
   *
   * @param {object} data
   * @param {object} response
   *
   */
  this.votes = function ( data, response ) {
    var query = 'SELECT * FROM votes WHERE users_id = ' + data.users_id + ' AND ideas_id = '+data.ideas_id;
    if ( data.type === 'upvotes' ) {
      data.upvotes = 1;
    } else {
      data.downvotes = 1;
    }

    var type = data.type;
    delete data['type'];

    var thisInstance = this;
    thisInstance.connection.getConnection(function ( err, connection ) {
      connection.query(query, function ( err, result ) {
        if ( result.length === 0 ) {
          insert = thisInstance.insertQuery('votes', data, response);
          connection.query(insert, function ( err, result ) {
            if( !err ) {
              response.json({'value':1, 'type': type});
            }
          });
        } else {
          if( (result[0].upvotes == 1 && type === 'upvotes')
            || (result[0].downvotes == 1 && type === 'downvotes') ) {
            var deleteQuery = 'DELETE FROM votes WHERE id = ' + result[0].id;
            connection.query(deleteQuery, function ( err, result ) {
              if( !err ) {
                response.json({'value':-1, 'type':type});
              }
            });
          } else {
            if ( type === 'upvotes' ) data.downvotes = 0;
            else data.upvotes = 0;
            var update = thisInstance.updateTable('votes', data, {id:result[0].id});
            connection.query(update, function ( err, result ) {
              if ( !err ) {
                response.json({'value':1, 'type':'both'});
              }
            });
          }
        }
      })
    })
  }

  /**
   * Generic method for building query for update table
   *
   * @param {string} tableName
   * @param {object} data
   * @param {string} whereClause
   *
   */
  this.updateTable = function ( tableName, data, whereClause ) {
    var query = "UPDATE "+tableName+" SET ";
    var startFlag = true;

    for ( var key in data ) {
      if ( !startFlag ) {
        query += ', ';
      }
      query += key +" = '"+data[key]+"'";
      startFlag = false;
    }
    query += ' WHERE ';
    startFlag = true;

    for ( var key in whereClause ) {
      if( !startFlag ) {
        query += ' AND ';
      }
      query += key + " = '" + whereClause[key] + "'";
      startFlag = false;
    }
    return query;
  }
};

module.exports = DbHandler;
