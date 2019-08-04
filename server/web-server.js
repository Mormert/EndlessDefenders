var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const serveIndex = require('serve-index')
const path = require('path');

var NumberOfConnectedPlayers = 0;

var NewPlayerConnected =0;

var PlayerID = new Array(5)
for (var i=0; i<5; i++) {
  PlayerID[i]='';
}

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/test.html');
});


io.on('connection', function (socket) {
  // Ny spelare ansluter


 
  for (var i=1; i<5; i++) {
    
    if (PlayerID[i]==''){
      NewPlayerConnected=i; // Anger vilken spelare som ansluter. Första lediga
      i=5;
    }
  }

  NumberOfConnectedPlayers++;
  console.log('A Player connected, Player: ' + NewPlayerConnected);
  PlayerID[NewPlayerConnected] = socket.id
  console.log('Player' + NewPlayerConnected + ' have socket.id: ' + socket.id )
  socket.emit('text message','Welcome player ' + NewPlayerConnected); // Skickar välkommen endast till uppkoppld spelare

  io.emit('text message', 'Player connected: ' + NewPlayerConnected);

  io.emit('text message', "Number of connected users: " + NumberOfConnectedPlayers)


  socket.on('text message', function (msg) { // Inkommande meddelande från en spelare
    socket.broadcast.emit('text message', socket.id + " " + msg);
    // Vilken spelare kom meddelande ifrån?
    
    for (var i=0; i<5; i++) {
 
      if (socket.id==PlayerID[i]){
        console.log('message from player: ' + i + ': ' + msg);
        socket.broadcast.emit('text message', 'message from player ' + i + ": " + msg);
        i=5;
      }
    }

    
  });
  



  socket.on('disconnect', function () {
    // Vilken Spelare 
    NumberOfConnectedPlayers--;

    for (var i=0; i<5; i++) {
 
      if (socket.id==PlayerID[i]){
        console.log('Player ' + i + ': ' + 'Disconnected');
        io.emit('text message', 'Player ' + i + ': ' + 'Disconnected');
        PlayerID[i]='';
        i=5;
      }
    }
    
    
  });
});





http.listen(3000, function () {
  console.log('listening on *:3000');
});




/* const express = require('express');
const app = express();
const serveIndex = require('serve-index')
const path = require('path');

const gameServer = require('./game-server');

// Startar spelserverns kod som finns i game-server.js
const game = gameServer();
*/
// Då man går till webbserverns root, så skickar servern tillbaka client/game-client.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'game-client.html'));
});


// Öppnar så att man kan komma åt client-filerna genom ../public/
// Detta är ett måste, om spelarna ska kunna nå game-client.js och andra asset-filer.
app.use('/public', express.static(path.join(__dirname, '../client')));

// Startar en FTP-tjänst för alla filer som finns i client och går att komma åt på ../client-ftp/
// Notera att alla filer som finns på FTP-tjänsten går även att kolla åt på ../public/ men som körbara filer (t.ex körbar JavaScript).
app.use('/client-ftp', express.static(path.join(__dirname, '../client')), serveIndex((path.join(__dirname, '../client')), {'icons': true}));

// Startar en FTP-tjänst för alla filer som finns på servern och får att komma åt på ../server-ftp/
// Detta vill man inte ska finnas på en produktionsserver, då spelarna kan komma åt källkoden till servern.
app.use('/server-ftp', express.static('./'), serveIndex('./', {'icons': true}))

/*
app.listen(3001, () => {
    console.log('Web server listening on port 3000!');
}); */