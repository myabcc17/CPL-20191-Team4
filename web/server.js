var express = require('express');
var app = express();
var AWS = require('aws-sdk');
AWS.config.region = 'ap-northeast-2';
var ex2 = new AWS.EC2();
var router = require('./router/main')(app);

app.set('views', __dirname + '/webapp');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var server = app.listen(8080, function () {
    console.log("Express server has started on port 8080")
});

app.use(express.static('.'));