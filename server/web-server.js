const request = require('request');
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const serveIndex = require('serve-index')
const path = require('path');

var NumberOfConnectedPlayers = 0;

var NewPlayerConnected = 0;

var NumberOfEnemysAlive = 30;

var PlayerXPosOnServer = new Array(5);
for (var i = 0; i < 5; i++) {
  PlayerXPosOnServer[i] = 25 * i;
}

var PlayerID = new Array(5);
for (var i = 0; i < 5; i++) {
  PlayerID[i] = '';
}

var conectedPlayers = new Array(5);
for (var i = 0; i < 5; i++) {
  conectedPlayers[i] = false;
}
var playerData = {
  Player: 0,
  PosX: 0
}
var playerDataFire = {
  Player: 0,
  PosX: 0
}

var enemyShipArray = Create2DArray(8);

for (let i = 0; i < 6; i++) {
  for (let j = 0; j < 5; j++) {
    enemyShipArray[i][j] = {
      posx: 25 + i * 15,
      posy: 15 + 15 * j,
      alive: true,
      hp: 3
    }
  }
}

io.on('connection', function (socket) {
  // Ny spelare ansluter
  for (var i = 1; i < 5; i++) {
    if (PlayerID[i] == '') {
      NewPlayerConnected = i; // Anger vilken spelare som ansluter. Första lediga
      i = 5;
    }
  }

  NumberOfConnectedPlayers++;
  if (NumberOfConnectedPlayers == 5) // Se till att det bara går att ansluta 4 spelare
  {
    NumberOfConnectedPlayers = 4;
    socket.disconnect(true) // Koppla bort spelare 5 om den försöker ansluta
  }
  else {
    PlayerXPosOnServer[NewPlayerConnected] = NewPlayerConnected * 25;
    console.log('Total number of connected players: ' + NumberOfConnectedPlayers)
    conectedPlayers[NewPlayerConnected] = true
    console.log('A Player connected, Player: ' + NewPlayerConnected);
    PlayerID[NewPlayerConnected] = socket.id
    console.log('Player' + NewPlayerConnected + ' have socket.id: ' + socket.id)
    socket.emit('myOwnID', NewPlayerConnected); // Skickar välkommen endast till uppkoppld spelare

    //io.emit('text message', 'Player connected: ' + NewPlayerConnected);

    //io.emit('text message', "Number of connected users: " + NumberOfConnectedPlayers)

    io.emit('PlayerInfo', conectedPlayers);
    console.log('PlayerInfo: ' + conectedPlayers);
    io.emit('EnemyData', enemyShipArray); // Skicka fiendeskeppens position

    for (var i = 1; i < 5; i++) {
      playerData.Player = i;
      playerData.PosX = PlayerXPosOnServer[i];
      //console.log('Player x Pos: ' + playerData.Player + ' ' + playerData.PosX);
      io.emit('PlayerXPos', playerData)
      console.log('New player connected, sending X pos for all players. Player: ' + i + ' x=' + playerData.PosX)
    }

    socket.on('text message', function (msg) { // Inkommande meddelande från en spelare
      //socket.broadcast.emit('text message', socket.id + " " + msg);
      // Vilken spelare kom meddelande ifrån?
      for (var i = 0; i < 5; i++) {
        if (socket.id == PlayerID[i]) {
          console.log('message from player: ' + i + ': ' + msg);
          //socket.broadcast.emit('text message', 'message from player ' + i + ": " + msg);
          i = 5;
        }
      }
    });

    socket.on('PlayerXPos', function (msg) {
      for (var i = 0; i < 5; i++) {
        if (socket.id == PlayerID[i]) {
          playerData.Player = i;
          playerData.PosX = msg
          //console.log('Player x Pos: ' + playerData.Player + ' ' + playerData.PosX);
          socket.broadcast.emit('PlayerXPos', playerData)
          PlayerXPosOnServer[i] = playerData.PosX;
          i = 5;
        }
      }
    });

    socket.on('PlayerFire', function (msg) {
      for (var i = 0; i < 5; i++) {
        if (socket.id == PlayerID[i]) {
          playerDataFire.Player = i;
          playerDataFire.PosX = msg
          //console.log('Player x Pos at fire: ' + playerDataFire.Player + ' ' + playerDataFire.PosX);
          socket.broadcast.emit('PlayerFire', playerDataFire)

          i = 5;
        }
      }
    });

    socket.on('EnemyShipDied', function (data) {
      enemyShipArray[data.enemyx][data.enemyy].hp--;
      if (enemyShipArray[data.enemyx][data.enemyy].hp <= 0) { // Enemy dies
        enemyShipArray[data.enemyx][data.enemyy] = false;
        NumberOfEnemysAlive--;
      }
      io.emit('EnemyData', enemyShipArray);
      console.log('Hitting enemy: ' + data.enemyx + " " + data.enemyy);
      console.log('Enemy HP: ' + enemyShipArray[data.enemyx][data.enemyy].hp);
    });

    if (NumberOfEnemysAlive <= 0) {
      io.emit('PlayerWinns');
    }

    socket.on('disconnect', function () {
      // Vilken Spelare disconnectade
      NumberOfConnectedPlayers--;

      for (var i = 0; i < 5; i++) {

        if (socket.id == PlayerID[i]) {
          console.log('Player ' + i + ': ' + 'Disconnected');
          //io.emit('text message', 'Player ' + i + ': ' + 'Disconnected');
          conectedPlayers[i] = false
          io.emit('PlayerInfo', conectedPlayers);
          io.emit('PlayerDisconnect', i);
          PlayerID[i] = '';
          i = 5;
        }
      }
    });
  };
});

let goingRight = true;


let y = 0;

var refreshIntervalId = setInterval(() => {

  if (enemyShipArray[5][0].posx > 140) {
    goingRight = false;
    y = 2;
  } else
    if (enemyShipArray[0][0].posx < 10) {
      goingRight = true;
      y = 2;
    }
  if (enemyShipArray[0][0].posy > 50) {
    y = -45;
    io.emit('EnemyWinns');
    clearInterval(refreshIntervalId);
  }
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 5; j++) {
      if (goingRight) {
        enemyShipArray[i][j].posx += 2;
        enemyShipArray[i][j].posy += y;

      }
      else // going left
      {
        enemyShipArray[i][j].posx -= 2;
        enemyShipArray[i][j].posy += y;
      }
    }
  }
  y = 0;
  io.emit('EnemyData', enemyShipArray);

  var EnemyRandom = {
    ShipX: Math.floor(Math.random() * 6),
    ShopY: Math.floor(Math.random() * 5),
  }
  io.emit('EnemyFire', EnemyRandom)

}, 250);

function Create2DArray(rows) {
  var arr = [];

  for (var i = 0; i < rows; i++) {
    arr[i] = [];
  }
  return arr;
}


http.listen(3000, function () {
  console.log('listening on *:3000');
});

// Då man går till webbserverns root, så skickar servern tillbaka client/game-client.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client', 'game-client.html'));
});

// Öppnar så att man kan komma åt client-filerna genom ../public/
// Detta är ett måste, om spelarna ska kunna nå game-client.js och andra asset-filer.
app.use('/public', express.static(path.join(__dirname, '../client')));

// Startar en FTP-tjänst för alla filer som finns i client och går att komma åt på ../client-ftp/
// Notera att alla filer som finns på FTP-tjänsten går även att kolla åt på ../public/ men som körbara filer (t.ex körbar JavaScript).
app.use('/client-ftp', express.static(path.join(__dirname, '../client')), serveIndex((path.join(__dirname, '../client')), { 'icons': true }));

// Startar en FTP-tjänst för alla filer som finns på servern och får att komma åt på ../server-ftp/
// Detta vill man inte ska finnas på en produktionsserver, då spelarna kan komma åt källkoden till servern.
app.use('/server-ftp', express.static('./'), serveIndex('./', { 'icons': true }))

// Uppdaterar duckdns.org dynamiska DNS med denna dators IP var femte minut, så att man kan nå denna server (om den är port-forwardad) på endless-defenders.duckdns.org/
setInterval(function(){
  request('https://www.duckdns.org/update?domains=endless-defenders&token=23409bb3-8d9d-4772-b233-1270b9ead176', function (error, response, body) {
    //console.error('error:', error);
    //console.log('statusCode:', response && response.statusCode);
    console.log('Updated dynamic DNS:', body); 
  });
}, 1000 * 300);