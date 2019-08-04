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

    ship = this.add.sprite(75, 125, 'player_ship_01').setDepth(1);    

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
        ship.x -= speed * delta;
    }
    else if (cursors.right.isDown)
    {
        ship.x += speed * delta;
    }

    if (cursors.up.isDown && time > lastFired)
    {
        var bullet = bullets.get();

        if (bullet)
        {
            bullet.fire(ship.x, ship.y);

            lastFired = time + 50;
        }
    }
}