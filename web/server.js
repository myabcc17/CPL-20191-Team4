express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

app.use('/js', express.static(__dirname + '/js'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/css', express.static(__dirname + '/vendor/bootstrap/css'));
app.use('/js', express.static(__dirname + '/vendor/bootstrap/jquery'));
app.use('/js', express.static(__dirname + '/vendor/bootstrap/js'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); 
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); 
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

/*CONFIGURE APP TO USE bodyParser*/
app.use(bodyParser.urlencoded({ exteded: true }));
app.use(bodyParser.json());

/*CONFIGURE SERVER PORT*/
var port = process.env.PORT || 8080;

/*CONFIGURE ROUTER*/
var router = require('./router/')(app);

app.set('views', __dirname + '/webapp');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var server = app.listen(port, function() {
    console.log("Express server has started on port " + port);
});

/*CONNECT TO MONGODB SERVER*/
var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function() {
    //CONNECTED TO MONGODB SERVER
    console.log("Connected to mongod server");
});

mongoose.connect('mongodb://localhost/PORTAI');

var Member = require('./model/member');
