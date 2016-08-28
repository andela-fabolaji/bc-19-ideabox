var express = require('express');
var bodyParser = require('body-parser')
var agent = require('superagent');

var app = express();
var routes = require('./route/route');
app.use(express.static(__dirname + '/public/'));
app.use(express.static(__dirname + '/src/'));

var path = __dirname + "/src/views/";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set('src/views', path);
app.set('view engine', 'ejs');

app.listen(3000, function () {
  console.log("Server running at Port 3000");
});

app.get('/', function ( req, res ) {
  agent
    .get('http://127.0.0.1:3000/get_ideas')
    .end(function ( err, result ) {
      res.render(path + "index", {
        'title': 'ideabox | ...your idea is awesome!',
        'ideas':result.body.ideas
      });
    })
});

app.get('/home/profile', function ( req, res ) {
  res.render(path + "profile", {
    'title':'Ideabox | Profile'
  });
});

routes(app);

app.get('/home', function ( req, res ) {
  agent
    .get('http://127.0.0.1:3000/get_ideas')
    .end(function ( err, result ){
      var data = result.body;
      res.render(path + "home", {
        'title':'My Ideabox',
        'ideas': data.ideas,
        'trending' : data.trends
      });
    })
});
