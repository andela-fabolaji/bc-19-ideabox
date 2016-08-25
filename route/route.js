var routes = function(app) {
  app.post('/signup', function (req, res) {
    var data = req.body;
    var details = { 'email':data.email, 'password':data.password };
    db.signin(details, res);
  });

  app.post('/signin', function (req, res) {
    var data = req.body;
    
  });
}