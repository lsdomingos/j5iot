# Johnny-Five + MKR1000 

Project to explore possibilities of WIFI connected micro-controller with Javascript interfaces

## Getting Started

Connect device through WIFI using StandardWifiFIrmata for Arduino. After gettting device IP modify Ethenet IP for connection as follows:

var board = new five.Board({
  port: new EtherPortClient({
    host: "", //Your IP goes here
    port: 3030
  }),
  timeout: 1e5,
  repl: true
});

### Prerequisites

node >= 6


### Installing

--Client

npm install
node index.js

--Server
npm install
node index.js


## Deployment

Add additional notes about how to deploy this on a live system

## Built With

* [Johnny-Five io](http://johnny-five.io) - The web framework used
* [Arduino](https://www.arduino.cc/) - Dependency Management
* [Node](https://nodejs.org/en/) - Used to generate RSS Feeds

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

0.0.1

## Authors

* **Luís Domingos* - *Initial work* - [lsdomingos](https://github.com/lsdomingos)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Balance

