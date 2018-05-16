//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var cors = require('cors')

var EtherPortClient = require("etherport-client").EtherPortClient;
var five = require('johnny-five')


//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
router.use(cors())
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));
var drinks = [];
var sockets = [];



// 
io.on('connection', function (socket) {
  console.log('-------SERVER SOCKET ON!------>')
  let uniqueHold = true
  

  // Routes
  //

  router.get('/connectdevice/:ip/:name', (req, res) => {
    let board;
    let ip = req.params.ip
    let name = req.params.name

    if (!ip) res.send({
      response: 'NO IP!'
    })
    //Johnny-five initialization
    board = new five.Board({
      port: new EtherPortClient({
        host: ip, //Your IP goes here
        port: 3030
      }),
      timeout: 1e5,
      repl: true
    });

    board.on("ready", function () {
      console.log("HELLO CLIENT! YOU ARE NOW CONNECTED TO DEVICE: " + ip);
      socket.emit('connectedToDevice', 'connected')

      // this.on("exit", function() {
      //   console.log(board)
      // });
      // Create a new `button` hardware instance.
      // This example allows the button module to
      // create a completely default instance

      button = new five.Button(7);


      // Inject the `button` hardware into
      // the Repl instance's context;
      // allows direct command line access
      board.repl.inject({
        button: button
      });

      // Button Event API

      // "down" the button is pressed
      button.on("down", function (e) {
        console.log("down");
      });

      // "hold" the button is pressed for specified time.
      //        defaults to 500ms (1/2 second)
      //        set
      button.on("hold", function () {
        console.log("hold", uniqueHold);
        if (!uniqueHold) return
        socket.emit('drinkAvailable', uniqueHold)
        uniqueHold = !uniqueHold;

      });

      // "up" the button is released
      button.on("up", function (e) {
        console.log("up");
        socket.emit('drinkUnavailable', uniqueHold)
        uniqueHold = !uniqueHold;
      });

    })
    
    res.send({
      response: 'CONNECTED TO IoT DEVICE HARDWARE'
    })


  });


  // 
  // Routes
  //

  sockets.push(socket);


  socket.on('disconnect', function () {
    console.log('----------DISCONNECTED---------->')
    socket.emit('disconnectedFromDevice', 'disconnected')
    sockets.splice(sockets.indexOf(socket), 1);
  });

  socket.on('drinkRequest', function (data) {
    var data = String(data || '');

    if (!data)
      return;
  });


})


server.listen(process.env.PORT || 4000, process.env.IP || "0.0.0.0", function () {
  var addr = server.address();
  console.log("Server listening at", addr.address + ":" + addr.port);
});