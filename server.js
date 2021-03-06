/**
 * Created by Paul on 3/1/2017.
 Edited my miguel 3-10-2017
 */
var osc = require("osc");
var express = require('express');
var http = require("http");
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var fs = require("fs");
var path = require("path");
var exec = require("child_process").exec

app.set('port', (5000));
server.listen(5001);

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function (request, response) {
    response.render('index');
});

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});

var getIPAddresses = function () {
    var os = require("os"),
        interfaces = os.networkInterfaces(),
        ipAddresses = [];

    for (var deviceName in interfaces) {
        var addresses = interfaces[deviceName];

        for (var i = 0; i < addresses.length; i++) {
            var addressInfo = addresses[i];

            if (addressInfo.family === "IPv4" && !addressInfo.internal) {
                ipAddresses.push(addressInfo.address);
            }
        }
    }

    return ipAddresses;
};

var udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 7400,
    remoteAddress: "127.0.0.1",
    remotePort: 7500
});

udpPort.on("ready", function () {
    var ipAddresses = getIPAddresses();
    console.log("Listening for OSC over UDP.");
    ipAddresses.forEach(function (address) {
        console.log("Host:", address + ", Port:", udpPort.options.localPort);
    });
    console.log("Broadcasting OSC over UDP to", udpPort.options.remoteAddress + ", Port:", udpPort.options.remotePort);
});

// Open the socket.
udpPort.open();

var bttn1 = 0;
var bttn2 = 0;
var bttn3 = 0;
var bttn4 = 0;
var bttn5 = 0;
var bttn6 = 0;

io.sockets.on("connect", function (socket) {
    console.log("A user has connected");
    socket.emit("connection_made");
    socket.on("button_click_1", function () {
        ++bttn1;
    });
    socket.on("button_click_2", function () {
        ++bttn2;
    });
    socket.on("button_click_3", function () {
        ++bttn3;
    });
    socket.on("button_click_4", function () {
        ++bttn4;
    });
    socket.on("button_click_5", function () {
        ++bttn5;
    });
    socket.on("button_click_6", function () {
        ++bttn6;
    });
    socket.on("disconnect", function () {
        console.log("A user has disconnected");
    });
});

// Every five seconds, send an OSC message to SuperCollider
setInterval(function () {
    var msg = {
        address: "/new/button/values/",
        args: [bttn1, bttn2, bttn3, bttn4, bttn5, bttn6]
    };

    console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
    console.log("Style 1: " + bttn1 + "\n" + "Style 2: " + bttn2 + "\n" + "Style 3: " + bttn3 + "\n" + "Style 4: " + bttn4 + "\n" + "Tempo up: " + bttn5 + "\n" + "Tempo down: " + bttn6 + "\n");

    var console_message = "Style WINNER: ";
    if (bttn1 > bttn2 && bttn1 > bttn3 && bttn1 > bttn4) {
        console_message+="1"
    } else if (bttn2 > bttn1 && bttn2 > bttn3 && bttn2 > bttn4) {
        console_message+="2"
    } else if (bttn3 > bttn1 && bttn3 > bttn2 && bttn3 > bttn4) {
        console_message+="3"
    } else if (bttn4 > bttn1 && bttn4 > bttn2 && bttn4 > bttn3) {
        console_message+="4"
    } else {
        console_message+="tie"
    }

    console_message+="\nTempo WINNER: "

    if (bttn5 > bttn6) {
        console_message+="faster"
    } else if (bttn5 < bttn6) {
        console_message+="slower"
    } else {
        console_message+="tie"
    }

    console.log(console_message + "\n\n\n");
    udpPort.send(msg);

    //reset all button values
    bttn1 = 0;
    bttn2 = 0;
    bttn3 = 0;
    bttn4 = 0;
    bttn5 = 0;
    bttn6 = 0;
}, 5000);
