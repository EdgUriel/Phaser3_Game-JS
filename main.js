
var config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('background', 'assets/backg.jpg');
    this.load.image('ground', 'assets/suelo.jpg');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('gameOver', 'assets/gameover.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create ()
{
    // Ajustar el fondo al tamaño de la pantalla
    let background = this.add.image(0, 0, 'background').setOrigin(0, 0);
    background.setDisplaySize(window.innerWidth, window.innerHeight);

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    platforms.create(window.innerWidth * .15, window.innerHeight - 10, 'ground').setScale(0.25).refreshBody();
    platforms.create(window.innerWidth * .45, window.innerHeight - 10, 'ground').setScale(0.25).refreshBody();
    platforms.create(window.innerWidth * .75, window.innerHeight - 10, 'ground').setScale(0.25).refreshBody();
    platforms.create(window.innerWidth, window.innerHeight - 10, 'ground').setScale(0.25).refreshBody();


    //  Now let's create some ledges
    platforms.create(window.innerWidth * 0.55, window.innerHeight * 0.66, 'ground').setScale(0.2,0.15).refreshBody();;
    platforms.create(window.innerWidth * 0.1, window.innerHeight * 0.41, 'ground').setScale(0.2,0.15).refreshBody();;
    platforms.create(window.innerWidth * 0.93, window.innerHeight * 0.37, 'ground').setScale(0.2,0.15).refreshBody();;

    // The player and its settings
    player = this.physics.add.sprite(100, window.innerHeight - 150, 'dude');

    //  Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {

        //  Give each star a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    bombs = this.physics.add.group();

    //  The score
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    //  Collide the player and the stars with the platforms
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.physics.add.overlap(player, stars, collectStar, null, this);

    this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update ()
{
    if (gameOver)
    {
        return;
    }

    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-400);
    }
}

function collectStar (player, star)
{
    star.disableBody(true, true);

    //  Add and update the score
    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0)
    {
        //  A new batch of stars to collect
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;

    }
}

function hitBomb(player, bomb) {
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;

    // Mostrar la imagen de "Game Over" centrada y redimensionada
    const gameOverImage = this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'gameOver');
    gameOverImage.setScale(Math.min(window.innerWidth / gameOverImage.width, window.innerHeight / gameOverImage.height));

    // Mostrar el puntaje final centrado
    this.add.text(window.innerWidth / 2, window.innerHeight * 0.8, 'Final Score: ' + score, { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
}

window.addEventListener('resize', () => {
    let canvas = game.canvas;
    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    game.scale.resize(width, height);
});
