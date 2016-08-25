var DbHandler = require('./controllers/dbcontroller');
var dBase = new DbHandler();

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
    dBase.insertQuery('users', details, res);
  });
}

module.exports = routes;