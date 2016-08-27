var DbHandler = require('./controllers/dbcontroller');
var dBase = new DbHandler();
var express = require('express');
var jwt = require('jsonwebtoken');

var routes = function(app) {
  app.post('/signin', function (req, res) {
    var data = req.body;
    var details = { 'email':data.email, 'password':data.password };
    dBase.signin(details, res);
  });

  app.post('/signup', function (req, res) {
    var data = req.body;
    var fullname = data.fullname.split(' ');
    var details = {
      'firstname':fullname[1],
      'lastname':fullname[0],
      'email':data.regemail,
      'password':data.regpassword
    }
    dBase.register(details, res);
  });

  app.get('/get_ideas', function (req, res) {
    var data = req.body;
    dBase.getIdeas(res);
  });

  var apiRoutes = express.Router();

 apiRoutes.use(function (req, res, next) {
    var token = req.body.token || req.query.q || req.headers['token-information'];
    if (token) {
      jwt.verify(token, 'key', function (err, decoded) {
        if (err) {
          return res.json({status: false, msg: 'Unable to authenticate token.'});
        } else {
          req.decoded = decoded;
        }
      });
    } else {
      res.status(404).redirect('/');
    }
    next();
  });

  app.use('/', apiRoutes);
  app.use('/handler', apiRoutes);

}

module.exports = routes;