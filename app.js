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

app.get('/', function (req, res) {
  agent
    .get('http://127.0.0.1:3000/get_ideas')
    .end(function(err, result){
      res.render(path + "index", {
        'ideas':result.body
      });
    })
});

// app.get('*', function (req, res) {
//   res.render(path + '404');
// });

routes(app);

app.get('/home', function (req, res) {
  agent
    .get('http://127.0.0.1:3000/get_ideas')
    .end(function(err, result){
      res.render(path + "home", {
        'ideas':result.body
      });
    })
});
