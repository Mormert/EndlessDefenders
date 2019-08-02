const express = require('express');
const app = express();
const serveIndex = require('serve-index')
const path = require('path');

const gameServer = require('./game-server');

// Startar spelserverns kod som finns i game-server.js
const game = gameServer();

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


app.listen(3000, () => {
    console.log('Web server listening on port 3000!');
});