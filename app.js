var express = require('express');
var app = express();
var router = express.Router();
var path = __dirname + "/src/views/";


router.use(function (req, res, next) {
  console.log("/" + req.method);
  next();
});

router.get("/", function (req, res) {
  res.sendFile(path + "index.html");
});

app.use("/", router);
app.use(express.static(__dirname + '/public/'));

app.use("*", function (req, res) {
  res.sendFile(path + "404.html");
});

app.listen(3000, function () {
  console.log("Server running at Port 3000");
});