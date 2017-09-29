// THIS EXAMPLE WILL HIGHLIGHT A FEW OF THE MANY DIFFERENT FEATURES AVAILABLE WITH PHASER.IO
// THE FOLLOWING IS AN EXAMPLE OF A PLATFORMER GAME (mario, donkeykong, megaman)

//FIRST INITIALIZE A NEW GAME
//define the size of the game, game type, where to render
// && game states
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
	preload: preload,
	create: create,
	update: update,
	render: render,
});

//PRELOAD IS USED TO IMPORT ASSETS INTO THE GAME
function preload() {
    game.load.image('skyBase', 'assets/namek_sky1.png');
    game.load.image('skyHigh', 'assets/namek_sky2.png');
    game.load.image('earth', 'assets/namek_ground_earth.png');
    game.load.image('ledge', 'assets/namek_ground_ledge.png');
    game.load.image('cloud', 'assets/namek_ground_cloud_tile.png');
    game.load.spritesheet('vegeta', 'assets/vegeta_basic.png', 37, 44, 6);
    game.load.spritesheet('vegetaBlast', 'assets/blastTrim.png', 16, 12, 3,0 ,0);
    game.load.spritesheet('frieza', 'assets/frieza.png', 33, 41, 12);
    game.load.spritesheet('friezaBlast', 'assets/fzBlast.png', 48, 28, 2);

}
//DEFINE VARIABLES
// our character
var vegeta;
var vegetaHealth = 100;
var vegetaBlast;
var powerLevel = 0;

// enemy boss
var frieza;
var friezaHealth = 100;
var friezaBlast;
var friezaBlastTimer = 0;

// ground (think parent components) will have 3 subsets (earth / ledge / cloud)
var ground;

// GAME CONTROLS
var cursors;
var blastButton;
var powerUp;


// GAME DASHBORD
var vegetaDash;

//CREATE IS WHERE WE CONSTRUCT OUR GAME
function create() {

    // this game will use the build in ARCADE physics engine
	game.physics.startSystem(Phaser.Physics.ARCADE);

    //-----------------------------------------------------------------------------
//DESIGN THE GAME WORLD -------------------------------------------------------
    //-----------------------------------------------------------------------------
	// add the backdrop using tileSprite - starting coords / ending coords / source
    game.add.tileSprite(0, 0, 3200, 600, 'skyHigh');
    game.add.tileSprite(0, 600, 3200, 1200, 'skyBase');
    // set the world boundaries in pixels - starting coords / ending coords
    game.world.setBounds(0, 0, 3200, 1200);

    // REMEMBER THE GROUND VARIABLE
    ground = game.add.group();
    // specify that ground will occupy space or 'have a body'
    ground.enableBody = true;

    // MAKE THE BASE GROUND LAYER - 'EARTH' 
    // first declare the height placement position
    var earthHeight = game.world.height - 60;
    // create the earth - start at 0 on the x-axis and 60 px above bottom boundary of our game
    var earth = ground.create(0, earthHeight, 'earth');
    // our earth sprite is only 30px tall so we can apply a scale to it
    earth.scale.setTo(1, 2);
    // the earth should be able to be walked on
    earth.body.immovable = true;

    // add another chunk but leave a gap
    earth = ground.create(750, earthHeight, 'earth');
    earth.scale.setTo(1, 2);
    earth.body.immovable = true;

    // add another chunk with scaling to finish off the world
    earth = ground.create(1400, earthHeight, 'earth');
    earth.scale.setTo(3, 2);
    earth.body.immovable = true;


    // CREATE A LEDGE AS A DIFFERENT TYPE OF GROUND
    //add ledges throughout the level
    for(var i = 0; i < 8; i++) {
        // we are making a simple 10 ledge pattern starting at 200px on the x-axis
        // even ledges will be at 950px on the y-axis(250px high)
        // odd ledges will be at 850px on the y-axis(350px high)
        //ledge assets are 200px X 30px Y just fyi
    	if (i % 2 === 0) { 
    		var ledge = ground.create(200 + (i*200), 1000, 'ledge');
    		ledge.body.immovable = true; 
    	} else { ledge = ground.create(200 + (i * 200), 850, 'ledge'); }
    		ledge.body.immovable = true;
    }


    // LETS PRETEND NAMEK CLOUDS ARE SOLID OBJECTS FOR S&Gs
    // our clouds dimensions are 40px X by 30px Y
    // so scaling will be at play
    var cloud = ground.create(850, 700, 'cloud');
    cloud.scale.setTo(3, 1);
    cloud.body.immovable = true;
    //maybe some clouds aren't quite so sturdy
    cloud = ground.create(970, 700, 'cloud');



    //-----------------------------------------------------------------------------
//DESIGN OUR WEAPONS -------------------------------------------------------
    //-----------------------------------------------------------------------------
    //CREATE VEGETA'S BASIC BLAST
    // creates the blast which fires up to 8 rounds
    vegetaBlast = game.add.weapon(8, 'vegetaBlast');
    // make sure the blast can fuck shit up
    vegetaBlast.enableBody = true;
    //blast 'dies' when it leaves the camera field of vision
    vegetaBlast.bulletKillType = Phaser.Weapon.KILL_CAMERA_BOUNDS;
    //so the attack shoots forward
    vegetaBlast.fireAngle = Phaser.ANGLE_RIGHT;
    
    vegetaBlast.autoFire = false;
    vegetaBlast.fireRate = 250;
    vegetaBlast.bulletSpeed = 250;
    vegetaBlast.bulletSpeedVariance = 50;
    vegetaBlast.addBulletAnimation('vegetaBlast', [0, 1, 2], 35);

    //CREATE FRIEZA'S BASIC BLAST
    friezaBlast = game.add.weapon(2, 'friezaBlast');
    friezaBlast.enableBody = true;
    friezaBlast.bulletKillType = Phaser.Weapon.KILL_CAMERA_BOUNDS;
    friezaBlast.bulletSpeed = 300;
    friezaBlast.addBulletAnimation('friezaBlast', [0, 0, 1], 35);



    //-----------------------------------------------------------------------------
// CREATE VEGETA
    //-----------------------------------------------------------------------------
    vegeta = game.add.sprite(37, 1000, 'vegeta');
    //bring that dude to life
    game.physics.arcade.enable(vegeta);
    //add some bounce
    vegeta.body.bounce.y = 0.1;
    vegeta.body.gravity.y = 250;
    //keep him inbounds
    vegeta.body.collideWorldBounds = true;
    // add an animation for basic blast
    vegeta.animations.add('fireBlast', [4, 5]);
    // attaches the weapon to our character
    vegetaBlast.trackSprite(vegeta, 49, 22);
    //game camera follows player
    game.camera.follow(vegeta);


    //-----------------------------------------------------------------------------
// CREATE FREIZA
    //-----------------------------------------------------------------------------
    frieza = game.add.sprite(750, 1000, 'frieza');
    game.physics.arcade.enable(frieza);
    frieza.body.bounce.y = 0.3;
    frieza.body.gravity.y = 100;
    frieza.body.collideWorldBounds = true;
    frieza.animations.add('friezaFireBlast', [7,6,7,2] );
    frieza.animations.add('friezaTakeDamage', [9,10], 2, false, true );
    //arm freiza with a basic attack
    friezaBlast.trackSprite(frieza, 0, 20);


    //-----------------------------------------------------------------------------
// DEFINE OUR CONTROLS
    //-----------------------------------------------------------------------------
    cursors = game.input.keyboard.createCursorKeys();
    blastButton = game.input.keyboard.addKey(Phaser.Keyboard.F);
    powerUp = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);


        //-----------------------------------------------------------------------------
// DEFINE OUR GAME DASHBOARD
    //-----------------------------------------------------------------------------


    // dashboard = game.add.text(10,10,"Vegeta: " + vegetaHealth, {
    //     font: "32px Ariel", fill: "#fff"});
    //     dashboard.fixedToCamera = true;



}
function update() {
//-----------------------------------------------------------------------------
    //COLLISION DETECTION BETWEEN COMPONENTES
//-----------------------------------------------------------------------------
    game.physics.arcade.collide(vegeta, ground);
    game.physics.arcade.collide(frieza, ground);

    //OVERLAP DETECTION BETWEEN COMPONENTS
    game.physics.arcade.overlap(frieza, vegetaBlast.bullets, vegetaBasicHit );
    game.physics.arcade.overlap(vegeta, friezaBlast.bullets, friezaBasicHit );

    //VEGETA
    vegeta.body.velocity.x = 0;

    if (cursors.right.isDown) {
        vegeta.body.velocity.x = 150;
        vegeta.frame = 1;
    } else if (cursors.left.isDown) {
        vegeta.body.velocity.x = -80;
        vegeta.frame = 2;

    } else if(blastButton.isDown && vegeta.alive){
    	vegeta.body.velocity.x = 0;
    	vegeta.animations.play('fireBlast', 4, false);
    	vegetaBlast.fire();
    }else {
        vegeta.body.velocity.x = 0;
        vegeta.frame = 0;
    }
    if (powerUp.isDown && vegeta.body.touching.down) {
        console.log(powerUp.duration);
    }
    if (cursors.up.isDown && vegeta.body.touching.down) {
        vegeta.body.velocity.y = -350;
    }


    //FRIEZA
    if (frieza.alive) {

        if (game.time.now > friezaBlastTimer) {
            frieza.animations.play('friezaFireBlast', 6, false);
            friezaBlast.bulletAnimation = 'friezaBlast';
            friezaBlast.fireAtSprite(vegeta);
            friezaBlastTimer = game.time.now + 3000;
        }
    }
}


//-----------------------------------------------------------------------------
// DAMAGE DETECTION-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------

// checks frieza's health and reacts
function vegetaBasicHit(frieza, vegetaBlast) {
    console.log(friezaHealth);
    friezaHealth -= 5;
    if (friezaHealth > 0) {
        console.log(friezaHealth);
        vegetaBlast.kill();
        frieza.frame = 9;
        setTimeout(function() { frieza.frame = 1; }, 250);
    } else {
        console.log(friezaHealth);
        frieza.frame = 10;
        vegetaBlast.kill();
        setTimeout(function() {
        frieza.kill();
        }, 500);
    }
}

function friezaBasicHit(vegeta, friezaBlast) {
    console.log(vegetaHealth);
    vegetaHealth -= 15;
    if (vegetaHealth > 0) {
        friezaBlast.kill();
        // setTimeout(function() { vegeta.frame = 1; }, 250);
    } else {
        console.log(vegetaHealth);
        // vegeta.frame = 10;
        friezaBlast.kill();
        setTimeout(function() {
        vegeta.kill();
        }, 500);
    }
}

function render() {
    // game.debug.cameraInfo(game.camera, 32, 32);
    // game.debug.spriteCoords(vegeta, 32, 500);
}


