var DbHandler = require('./controllers/dbcontroller');
var dBase = new DbHandler();
var express = require('express');
var jwt = require('jsonwebtoken');

var routes = function ( app ) {

  app.post('/signin', function ( req, res ) {
    var data = req.body;
    var details = { 'email': data.email, 'password': data.password };
    dBase.signin( details, res );
  });

  app.post('/signup', function ( req, res ) {
    var data = req.body;
    var fullname = data.fullname.split(' ');
    var details = {
      'firstname':fullname[1],
      'lastname':fullname[0],
      'email':data.regemail,
      'password':data.regpassword
    }
    dBase.register( details, res );
  });

  app.get('/get_ideas', function ( req, res ) {
    var data = req.body;
    dBase.getIdeas( res );
  });

  var apiRoutes = express.Router();

  apiRoutes.use(function ( req, res, next ) {
    var token = req.body.token || req.query.q || req.headers['token-information'];
    if ( token ) {
      jwt.verify( token, 'key', function ( err, tokenvalue ) {
        if ( err ) {
          return res.json({status: false, msg: 'Unable to authenticate token.'});
        } else {
          req.tokenvalue = tokenvalue;
        }
      });
    } else {
      res.status(404).redirect('/');
    }
    next();
  });

  app.use('/', apiRoutes);
  app.use('/handler', apiRoutes);

  app.post('/publish', function ( req, res ) {
    var data = req.body;
    var details = {idea_title:data.postTitle, idea_desc:data.postContent,users_id:req.tokenvalue.id};
    var query = dBase.insertQuery('ideas', details, res);
    dBase.executeQuery( query );
  });

  app.post('/comment', function ( req, res ) {
    var data = req.body;
    var details = {user_comment:data.user_comment, ideas_id:data.ideas_id, users_id:req.tokenvalue.id};
    var query = dBase.insertQuery('comments', details, res);
    dBase.executeQuery( query );
  });

  app.get('/getcomments/:ideaId', function ( req, res ) {
    var query = "SELECT * FROM comments, users WHERE users_id = users.id AND ideas_id = "+req.params.ideaId
    dBase.getQueryData( query, res );
  });

  app.post('/votes/:ideaId', function ( req, res ) {
    var data = req.body;
    data.ideas_id = req.params.ideaId;
    data.users_id = req.tokenvalue.id;
    dBase.votes( data, res );
  })

};

module.exports = routes;