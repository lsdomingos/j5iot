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

//Johnny-five initialization
var board = new five.Board({
  port: new EtherPortClient({
    host: "192.168.1.97", //Your IP goes here
    port: 3030
  }),
  timeout: 1e5,
  repl: true
});

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
var messages = [];


board.on("ready", function () {
  console.log("READY!");

  let sockets = [];

  let led = new five.Led(13);

  board.repl.inject({
    led: led
  });

  led.off()

  io.on('connection', function (socket) {
    
    console.log('-------CONNECTED------>')
    let uniqueHold = true

    // Routes
    //
    

    router.get('/askforbeer/:name/:beer/:units', (req, res) => {
     

      let name = req.params.name
      let beer = req.params.beer
      let units = req.params.units


     
      // turn off LED after 1 second
      led.blink(500);

      socket.emit('requestDrink', JSON.stringify({
        name: name,
        beer: beer,
        units: units
      }));

      res.send({
        response: 'Obrigaddo pelo seu pedido! A sua fesquinha será enviada.'
      })
    });


    // 
    // Routes
    //

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
      socket.emit('fridgeAddDrink', 'add')
      uniqueHold = !uniqueHold;

    });

    // "up" the button is released
    button.on("up", function (e) {
      console.log("up");
      socket.emit('fridgeRemoveDrink', 'remove');
      uniqueHold = !uniqueHold;
    });

    messages.forEach(function (data) {
      socket.emit('message', data);
    });

    sockets.push(socket);

    socket.on('disconnect', function () {
      console.log('----------DISCONNECTED---------->')
      sockets.splice(sockets.indexOf(socket), 1);
      led.on();
      updateRoster();
    });

    socket.on('drinkRequestCompleted', function (data) {
      var data = String(data || '');

      if (!data)
        return;


    });

    socket.on('identify', function (name) {
      socket.name = name
      updateRoster();
    });
  });

  function updateRoster() {
    let namesList = [];
    async.map(
      sockets,
      function (socket, callback) {
        namesList.push(socket.name)
        callback()
      },
      function (err, names) {
        console.log('------ROSTER------->', namesList)
        broadcast('roster', namesList);
      }
    );
  }

  function broadcast(event, data) {
    sockets.forEach(function (socket) {
      socket.emit(event, data);
    });
  }

})



server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function () {
  var addr = server.address();
  console.log("Server listening at", addr.address + ":" + addr.port);
});