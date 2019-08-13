const config = {
    type: Phaser.AUTO,
    width: 150,
    height: 150,
    parent: 'game',
    backgroundColor: 'black',
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    zoom: 4,
    pixelArt: true,
};

var myBullets;
var ship;
var speed;
var stats;
var cursors;
var lastFired = 0;

var myOwnID = 0;
let socket;

var playerShips = {};
var enemyShipArray;

var game = new Phaser.Game(config);

function preload() {
    this.load.setBaseURL('../public/assets/')

    this.load.image('bullet', '/player_bullet.png');

    this.load.image('enemy_ship_01', '/enemy_ship_01.png');
    this.load.image('enemy_ship_02', '/enemy_ship_02.png');
    this.load.image('enemy_ship_03', '/enemy_ship_03.png');
    this.load.image('enemy_ship_04', '/enemy_ship_04.png');
    this.load.image('enemy_ship_05', '/enemy_ship_05.png');
    this.load.image('enemy_ship_06', '/enemy_ship_06.png');

    this.load.image('player_ship_01', '/player_ship_01.png');
    this.load.image('player_ship_02', '/player_ship_02.png');
    this.load.image('player_ship_03', '/player_ship_03.png');
    this.load.image('player_ship_04', '/player_ship_04.png');
}

function create() {

    socket = io();
    //socket = io('https://endless-defenders.duckdns.org/');

    socket.on('PlayerXPos', (data) => {
        let playerID = data['Player'];
        if (playerID != myOwnID) {
            playerShips[playerID].x = data['PosX'];
        }
    });

    playerShips[1] = this.add.sprite(25, -100, 'player_ship_01');
    playerShips[2] = this.add.sprite(50, -100, 'player_ship_02');
    playerShips[3] = this.add.sprite(75, -100, 'player_ship_03');
    playerShips[4] = this.add.sprite(100, -100, 'player_ship_04');

    socket.on('PlayerInfo', (data) => {

        if (myOwnID == 0) {
            alert('My Own ID is 0');
        }

        for (let i = 1; i < 5; i++) {
            if (data[i] == true) {
                if (i != myOwnID) {
                    playerShips[i].y = 125;
                    console.log(i);
                    console.log(playerShips);
                }
            }
        }

    });

    socket.on('disconnect', () => {
        for (let i = 1; i < 5; i++) {
            if (playerShips[i] != null || playerShips[i] != undefined) {
                //playerShips[i].destroy(true);
                playerShips[i].y = -100;
                console.log('destroying player ' + i);
            }
        }
    });

    socket.on('PlayerDisconnect', (playerid) => {
        playerShips[playerid].y = -100;
    });

    socket.on('reconnect', () => {

    });

    socket.on('connect', () => {

    });



    socket.on('myOwnID', (data) => {
        myOwnID = data;
        playerShips[myOwnID].y = 125;
    });


    socket.on('PlayerFire', (data) => {
        var bullet = otherPlayersBullets.get();

        if (bullet) {
            bullet.fire(playerShips[data.Player].x, playerShips[data.Player].y);
            bullet.myBullet = false;
        }
    });

    socket.on('EnemyData', (data) => {
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 5; j++) {
                enemyShipArray[i][j].x = data[i][j].posx;
                enemyShipArray[i][j].y = data[i][j].posy;
            }
        }
    });

    var Bullet = new Phaser.Class({

        Extends: Phaser.GameObjects.Image,

        myBullet: true,

        initialize: function Bullet(scene) {
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');

            this.speed = 0.1;
        },

        fire: function (x, y) {
            this.setPosition(x, y - 5);

            this.setActive(true);
            this.setVisible(true);
        },

        update: function (time, delta) {
            this.y -= this.speed * delta;

            
            for(let i = 0; i < 6 ; i++){
                for(let j = 0; j < 5; j++){
                    if(this.distance(enemyShipArray[i][j].x, enemyShipArray[i][j].y, this.x, this.y) < 7){
                        console.log('hit!');

                        this.y = -50;
                        this.setActive(false);
                        this.setVisible(false);
                        
                        if(this.myBullet){
                            socket.emit("EnemyShipDied", {
                                enemyx : i,
                                enemyy : j
                            });
                        }
                        break;
                    }
                }
            }
            
            if (this.y < -50) {
                this.setActive(false);
                this.setVisible(false);
            }
        },

        distance: function (x1, y1, x2, y2) {
            var dx = x1 - x2;
            var dy = y1 - y2;
            return Math.sqrt(dx * dx + dy * dy);
        }
    });

    myBullets = this.add.group({
        classType: Bullet,
        maxSize: 2,
        runChildUpdate: true
    });

    otherPlayersBullets = this.add.group({
        classType: Bullet,
        maxSize: 2,
        runChildUpdate: true
    });

    cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.addKeys({ 'up': Phaser.Input.Keyboard.KeyCodes.W, 'down': Phaser.Input.Keyboard.KeyCodes.S });

    enemyShipArray = Create2DArray(8);

    function Create2DArray(rows) {
        var arr = [];

        for (var i = 0; i < rows; i++) {
            arr[i] = [];
        }
        return arr;
    }

    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 5; j++) {
            enemyShipArray[i][j] = this.add.sprite(-100,-100, 'enemy_ship_0' + (j + 1));
        }
    }

    speed = 0.05;
}

function update(time, delta) {

    if (cursors.left.isDown) {
        playerShips[myOwnID].x -= speed * delta;
        socket.emit("PlayerXPos", playerShips[myOwnID].x);
    }
    else if (cursors.right.isDown) {
        playerShips[myOwnID].x += speed * delta;
        socket.emit("PlayerXPos", playerShips[myOwnID].x);
    }

    if (cursors.up.isDown && time > lastFired) {
        var bullet = myBullets.get();

        if (bullet) {
            bullet.fire(playerShips[myOwnID].x, playerShips[myOwnID].y);
            socket.emit("PlayerFire", playerShips[myOwnID].x);

            lastFired = time + 50;
        }
    }
}