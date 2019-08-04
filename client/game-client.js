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
    // physics: {
    //   default: 'arcade',
    //   arcade: {
    //     tileBias: 4,
    //     gravity: { y: 250 },
    //   }
    // },
  };

var bullets;
var ship;
var speed;
var stats;
var cursors;
var lastFired = 0;

var myOwnID = 0;

var playerShips = {};

var game = new Phaser.Game(config);

function preload ()
{
   

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

function create ()
{


    this.socket = io('192.168.1.121:3000');

    this.socket.on('PlayerXPos', (data) => {
        //console.log(data['Player']);
        //console.log(data['PosX']);

        let playerID = data['Player'];
        if(playerID != myOwnID){
            playerShips[playerID].x = data['PosX'];
        }
        

        
    });

    for(let i = 1; i < 5; i++){

    }

    playerShips[1] = this.add.sprite(25, -100, 'player_ship_01');
    playerShips[2] = this.add.sprite(50, -100, 'player_ship_02');
    playerShips[3] = this.add.sprite(75, -100, 'player_ship_03');
    playerShips[4] = this.add.sprite(100, -100, 'player_ship_04');

    this.socket.on('text message', (msg) => {
        alert(msg);
    });

    this.socket.on('PlayerInfo', (data) => {

        if(myOwnID == 0){
            alert('My Own ID is 0');
        }

        for(let i = 1; i < 5; i++){
            if(data[i] == true){
                if(i != myOwnID){
                    playerShips[i].y = 125;
                    console.log(i);
                    console.log(playerShips);
                }
            }
        }

    });

    this.socket.on('disconnect', () => {
        for(let i = 1; i < 5; i++){
            //if(i != myOwnID){
                if(playerShips[i] != null || playerShips[i] != undefined){
                    //playerShips[i].destroy(true);
                    playerShips[i].y = -100;
                    console.log('destroying player ' + i);
                }
            //}
        }
        //ship.destroy(true);

    });

    this.socket.on('PlayerDisconnect', (playerid) => {

        //playerShips[data].destroy(true);
        playerShips[playerid].y = -100;
        //console.log('DESTROYING PLAYER SHIP' + data);
        
    });

    this.socket.on('reconnect', () => {

    });
    
    this.socket.on('connect', () => {

    });
    


    this.socket.on('myOwnID', (data) => {
        myOwnID = data;
        //ship = this.add.sprite(75, 125, 'player_ship_0' + myOwnID).setDepth(1);
        playerShips[myOwnID].y = 125;
    });



    var Bullet = new Phaser.Class({

        Extends: Phaser.GameObjects.Image,

        initialize:

        function Bullet (scene)
        {
            Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');

            this.speed = 0.1;
        },

        fire: function (x, y)
        {
            this.setPosition(x, y - 5);

            this.setActive(true);
            this.setVisible(true);
        },

        update: function (time, delta)
        {
            this.y -= this.speed * delta;

            if (this.y < -50)
            {
                this.setActive(false);
                this.setVisible(false);
            }
        }

    });

    bullets = this.add.group({
        classType: Bullet,
        maxSize: 2,
        runChildUpdate: true
    });

       

    cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.addKeys({ 'up': Phaser.Input.Keyboard.KeyCodes.W, 'down': Phaser.Input.Keyboard.KeyCodes.S });

    for (let i = 0; i < 8; i++) {
        this.add.sprite(25 + i * 15, 15, 'enemy_ship_01');
    }
    for (let i = 0; i < 8; i++) {
        this.add.sprite(25 + i * 15, 30, 'enemy_ship_02');
    }
    for (let i = 0; i < 8; i++) {
        this.add.sprite(25 + i * 15, 45, 'enemy_ship_03');
    }
    for (let i = 0; i < 8; i++) {
        this.add.sprite(25 + i * 15, 60, 'enemy_ship_04');
    }
    for (let i = 0; i < 8; i++) {
        this.add.sprite(25 + i * 15, 75, 'enemy_ship_05');
    }


    //speed = Phaser.Math.GetSpeed(300, 1);
    speed = 0.05;
}

function update (time, delta)
{

    if (cursors.left.isDown)
    {
        playerShips[myOwnID].x -= speed * delta;
        this.socket.emit("PlayerXPos", playerShips[myOwnID].x);
    }
    else if (cursors.right.isDown)
    {
        playerShips[myOwnID].x += speed * delta;
        this.socket.emit("PlayerXPos", playerShips[myOwnID].x);
    }

    if (cursors.up.isDown && time > lastFired)
    {
        var bullet = bullets.get();

        if (bullet)
        {
            bullet.fire(playerShips[myOwnID].x, playerShips[myOwnID].y);
            this.socket.emit("PlayerFire", playerShips[myOwnID].x);

            lastFired = time + 50;
        }
    }
}