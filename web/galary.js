var express = require('express');
var app = express();
var fs = require('fs');
var mjpegServer = require('mjpeg-server');

app.get('/', function(req, res) {
    console.log("Got request");
    mjpegHandler = mjpegServer.createReqHandler(req, res);
    var i = 0;
    var timer = setInterval(updateJPG, 5);

    function updateJPG() {
        fs.readFile(__dirname + '/save.jpg', sendJPGData);
        i++;
    }

    function sendJPGData(err, data) {
        mjpegHandler.update(data, function() {
            checkIfFinished();
        });
    }

    function checkIfFinished() {
        if (i > 100) {
            clearInterval(timer);
            mjpegHandler.close();
            console.log('End Request');
        }
    }
})
app.listen(3000, function() {
    console.log('Server start (port : 3000)');
})