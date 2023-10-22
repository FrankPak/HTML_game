var config = {
    type: Phaser.AUTO,
    backgroundColor: "#30D5C8",
    width: 800,
    height: 600,
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

var game = new Phaser.Game(config);

var player;
var stars;
var superStars;
var bombs;
var platforms;
var score = 0;
var scoreText;
var finalScoreText;
var music;
var movingPlatform;
var movingPlatform2;




function preload (){
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('superStar', 'assets/superStar.png');
    this.load.image('bomb', 'assets/bullet1.png');
    this.load.audio('jump', 'assets/audio/sfx_jump.mp3');
    this.load.audio('bgmusic', 'assets/audio/Winter-Vivaldi.mp3')
    this.load.spritesheet('dude', 
        'assets/dude.png',
        { frameWidth: 32, frameHeight: 48 }
    );
}



function create (){
    //Platforms
    platforms = this.physics.add.staticGroup();

    platforms.create(400, 600, 'ground').setScale(6).refreshBody();

    platforms.create(80,400, 'ground');
    platforms.create(700, 220, 'ground');

    //MovingPlatform
    movingPlatform = this.physics.add.image(300, 220, 'ground');
    movingPlatform.setImmovable(true);
    movingPlatform.body.allowGravity = false;
    movingPlatform.setVelocityX(50);

    movingPlatform2 = this.physics.add.image(600, 400, 'ground');
    movingPlatform2.setImmovable(true);
    movingPlatform2.body.allowGravity = false;
    movingPlatform2.setVelocityX(50);

    //Music
    bgmusic = this.sound.add('bgmusic');
    bgmusic.volume = 0.3;
    bgmusic.loop = true;
    bgmusic.play();

    jumpSound = this.sound.add('jump');
    
    //Player
    player = this.physics.add.sprite(400, 450, 'dude');

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(player, movingPlatform);
    this.physics.add.collider(player, movingPlatform2);

    //Star
    stars = this.physics.add.group({
        key: 'star',
        collideWorldBounds: true,
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });
    
    stars.children.iterate(function (child) {
    
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    
    });

    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(stars, movingPlatform);
    this.physics.add.collider(stars, movingPlatform2);

    this.physics.add.overlap(player, stars, collectStar, null, this);

    
    //SuperStar
    superStars = this.physics.add.group({
        collideWorldBounds: true,
    })
    this.physics.add.collider(superStars, platforms);
    this.physics.add.collider(superStars, movingPlatform);
    this.physics.add.collider(superStars, movingPlatform2);
    this.physics.add.overlap(player, superStars, collectSpecialStar, null, this);

    //Bombs
    bombs = this.physics.add.group();

    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(bombs, movingPlatform);
    this.physics.add.collider(bombs, movingPlatform2);

    this.physics.add.collider(player, bombs, hitBomb, null, this);



    
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    cursors = this.input.keyboard.createCursorKeys();

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

}

function update (){
    if (cursors.left.isDown){
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }else if (cursors.right.isDown){
        player.setVelocityX(160);

        player.anims.play('right', true);
    }else{
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down){
        player.setVelocityY(-330);
        jumpSound.play();
    }

    if (movingPlatform.x >= 300)
    {
        movingPlatform.setVelocityX(-50);
    }
    else if (movingPlatform.x <= 100)
    {
        movingPlatform.setVelocityX(50);
    }

    if (movingPlatform2.x >= 700)
    {
        movingPlatform2.setVelocityX(-50);
    }
    else if (movingPlatform2.x <= 400)
    {
        movingPlatform2.setVelocityX(50);
    }


}

function hitBomb (player, bomb){
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    finalScoreText = this.add.text(0, 400, 'You scored: '+ score, { fontSize: '60px', fill: '#000' });

    gameOver = true;
}

function collectSpecialStar (player,SpecialStar){
    SpecialStar.destroy();

    score += 50;
    scoreText.setText('Score: ' + score);
}

function collectStar (player, star){
    star.disableBody(true, true);
    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) == 0)
    {
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

        SuperStar = superStars.create(x, 16, 'superStar');

    }
}
