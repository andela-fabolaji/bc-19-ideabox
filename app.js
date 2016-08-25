var express = require('express');
var bodyParser = require('body-parser')

var app = express();
var routes = require('./route/route');
app.use(express.static(__dirname + '/public/'));
app.use(express.static(__dirname + '/src/'));

var path = __dirname + "/src/views/";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.listen(3000, function () {
  console.log("Server running at Port 3000");
});

app.get('/', function (req, res) {
  res.sendFile(path + "index.html");
});

app.get('*', function (req, res) {
  res.sendFile(path + '404.html');
});

routes(app);

// router.use(function (req, res, next) {
//   console.log("/" + req.method);
//   next();
// });

// router.get("/", function (req, res) {
//   res.sendFile(path + "index.html");
// });

// app.use("/", router);
// app.use(express.static(__dirname + '/public/'));

// app.use("*", function (req, res) {
//   res.sendFile(path + "404.html");
// });

// app.listen(3000, function () {
//   console.log("Server running at Port 3000");
// });