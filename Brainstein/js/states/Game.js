var Brainstein = Brainstein || {};
Brainstein.Game = function(){};

Brainstein.Game = {	
	//-----------------PHASER METHODS-----------------
	create: function(){
		//-----------------WORLD & LEVEL VARIABLES-----------------
		//Set world dimension
		this.game.world.setBounds(0, 0, 320, 320);		
		//this.background = this.game.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'floor_tile');		

		//Create Tiled map
		this.map = this.game.add.tilemap('level1');
		//The first parameter is the tileset name as specified in Tiled, the second is the key to the asset
		this.map.addTilesetImage('tileset', 'gameTiles');
		this.levelDimensions = {rows: this.map.layers[1].data.length, columns: this.map.layers[1].data[0].length};
		this.tileDimensions = {x: this.map.tileWidth, y: this.map.tileHeight};

		//Create map layers
		this.backgroundLayer = this.map.createLayer('backgroundLayer');
		this.collisionLayer = this.map.createLayer('collisionLayer');
		//Collision on blockedLayer
		this.setCollisionLayer();
		//Resizes the game world to match the layer dimensions
		this.backgroundLayer.resizeWorld();

		//-----------------WEAPON VARIABLES-----------------
	

		//Bullets and reload
		for(var i = 0; i < this.playersCount; i++){
			this.players[i].reloadTimer.add(2000, this.reloadMethod, this, this.players[i]);
		}
	
		this.bullets = this.game.add.group(); 
		this.bullets.enableBody = true;
   		this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
		this.bullets.createMultiple(50, 'bullet');
		this.bullets.setAll('anchor.x', 0.5);
		this.bullets.setAll('anchor.y', 0.5);
    	this.bullets.setAll('checkWorldBounds', true);
		this.bullets.setAll('outOfBoundsKill', true);
		//Reload text

		this.shot = [];

		//-----------------PLAYER VARIABLES-----------------
		//Create player
		this.players = [2];
		this.playersCount = 0;
		this.createPlayer(20, 150, 'erwin');	
		this.createPlayer(30, 150, 'zombie');		

		//Create text	
		this.hpTextPlayer1 = this.game.add.text(0, 520, "HP:" + this.players[0].actualHp + "/" + this.players[0].hp, { font: "55px Arial", fill: "#faaa00", align: "center" });
		this.hpTextPlayer1.fixedToCamera = true;
		
		this.hpTextPlayer2 = this.game.add.text(480, 520, "HP:" + this.players[0].actualHp + "/" + this.players[0].hp, { font: "55px Arial", fill: "#faaa00", align: "center" });
		this.hpTextPlayer2.fixedToCamera = true;
		
		//All animation here	

		//Enable player physics
		this.game.physics.startSystem(Phaser.Physics.ARCADE);		
		//this.game.physics.arcade.enable(this.enemies);	
	

		////-----------------ENEMIES VARIABLES-----------------
		//Enemies
		this.enemies = [];
		this.enemyCount = 0;
		//this.createEnemy(152, 32, 'zombie');			
		//this.createEnemy(352, 150, 'zombie');	
		//this.createEnemy(152, 32, 'zombie');		

		//-----------------PATHFINDING VARIABLES-----------------
		this.easyStar = new EasyStar.js();
		this.initPathfinding();		

		this.game.time.events.repeat(Phaser.Timer.SECOND * 1.5, Number.POSITIVE_INFINITY, this.allowPathfinding, this);
		//this.game.time.events.repeat(Phaser.Timer.SECOND * 0.1, 9223372036854775807, this.allowEnemyAttack, this);

		//-----------------ADITIONAL VARIABLES-----------------
		//Create action keys
		this.actionKeys = this.createKeys();
		
		//FPS
		this.game.time.desiredFps = 60;

		//The camera will follow the player			
		this.game.camera.follow(this.players[0], Phaser.Camera.FOLLOW_LOCKON, 0.05, 0.05);	

		//Text	
		this.reloadTextPlayer1 = this.game.add.text(0, 0, " ", { font: "20px Arial", fill: "#ffff00", align: "center" });
		this.reloadTextPlayer1.fixedToCamera = true;
		this.reloadTextPlayer2 = this.game.add.text(this.game.width - 400, 0, " ", { font: "20px Arial", fill: "#ffff00", align: "center" });
		this.reloadTextPlayer2.fixedToCamera = true;

		//Keyboard	

		//-----------------BUILDING VARIABLES-----------------		
		this.destructableBuildings = [];
		this.destructableBuildingsCount = 0;

		this.buildCost = 1;		
		//this.resourcesText = this.game.add.text(650, 0, "Recursos: " + this.players[0].resources, { font: "20px Arial", fill: "#ffff00", align: "center" });
		//this.resourcesText.fixedToCamera = true;
		//-----------------ROUND LOOP VARIABLES-----------------
		this.timeBetweenRounds = 2; //Tiempo entre rondas(numero)
		
		this.restTimer = this.game.time.create(false); //Timer entre rondas(objeto timer)
		this.restTimer.add(1000, this.startRound, this);
		this.restTimer.start(); //EMPIEZA LA RONDA 1

		this.restTimerText = this.game.add.text(500, 500, this.timeBetweenRounds, { font: "20px Arial", fill: "#faaa00", align: "center" });
		this.restTimerText.fixedToCamera = true;
		
		this.zombiesPerRound = 1;

		this.resting = true;

		this.actualRound = 0;
		this.actualRoundText = this.game.add.text(300, 0, "Ronda actual:" + this.actualRound, { font: "20px Arial", fill: "#40FF00", align: "center" });
		this.actualRoundText.fixedToCamera = true;
		//----------------DROPS-------------------
		this.dropTime = this.game.rnd.integerInRange(0,5);

		this.drops = [];

		this.dropTimer = this.game.time.create(false);
		this.dropTimer.add(1000,this.createDrop, this);
		this.dropTimer.start();
		this.dropTimer.pause();
	
		this.dropText = this.game.add.text(650, 250, "Next drop in: " + this.dropTime, { font: "20px Arial", fill: "#ffff00", align: "center" });
		this.dropText.fixedToCamera = true;
	
		this.dropProbability;
		this.dropComing = false;
		//-----------------------------------------

		//-----------------BRAIN VARIABLES-----------------
		this.brain = this.game.add.sprite(180, 180, "brain");
		this.game.physics.arcade.enable(this.brain);	
	},
	//-----------------CONSTRUCTOR METHODS-----------------
	createPlayer: function(x, y, sprite){
		var player = this.game.add.sprite(x, y, sprite);			
		player.anchor.setTo(0.5, 0.5);
		player.hp = 30;
		player.actualHp = player.hp;
		player.weapon = "pistol";
		player.building = false;
		player.pistolActualAmmo = Number.POSITIVE_INFINITY;
		player.shotgunActualAmmo = 0;
		player.akActualAmmo = 0;

		player.pistol = this.createWeapon("pistol",0,100,12,1,5,12,Number.POSITIVE_INFINITY,0,0);
		player.shotgun = this.createWeapon("shotgun",0,120,12,3,8,0,50,300,0.25);
		player.ak = this.createWeapon("ak",0,50,30,1,8,0,200,0,0);

		player.reloadTimer = this.game.time.create(false);
		player.reloadTimer.add(1000, this.reloadMethod, this,player);
		player.reloadTimer.start();
		player.reloadTimer.pause();	
			
		player.reloading = false;
		player.holdingBrain = false;		
		player.collideWorldBounds = true;		
		player.speed = 200;
		player.beingPushed = false;
		player.buildKeyJustPressed = false;
		player.grabBrainKeyJustPressed = false;
		player.vectorPush;
		player.zombiePushing
		player.dead = false;

		player.resources = 0;
		player.resourceText = this.game.add.text(150 * (this.playersCount * 3), 450, "Recursos jugador " + this.playersCount + ": " + player.resources,{ font: "20px Arial", fill: "#ABA7A7", align: "center" });
		player.resourceText.fixedToCamera = true;

		this.game.physics.arcade.enable(player);	
		player.body.collideWorldBounds = true;

		this.players[this.playersCount] = player;
		this.playersCount++;
		
	},

	//Creates an enemy
	createEnemy: function(x, y, texture){
		var zombie = this.game.add.sprite(x, y, texture); 
		this.game.physics.arcade.enable(zombie);
		//zombie.scale.setTo(0.05);
		zombie.anchor.setTo(0.5, 0.5);
		zombie.pathFindingAvaible = true;
		zombie.walkingSpeed = 70;
		zombie.body.collideWorldBounds = true;
		zombie.path = [];
		zombie.target = "player"
		zombie.targetBuilding;
		zombie.pathStep = -1;	
		zombie.hp = 10;	
		zombie.attackSpeed = 1;
		zombie.attackAvaible = true;	
		zombie.actualHp = zombie.hp;	
		zombie.damage = 5;
		zombie.pos = this.enemyCount;
		this.enemies[this.enemyCount] = zombie;		
		this.enemyCount++;
	},

	//Returns an array with all the hotkeys
	createKeys: function(){
		return {
			//PLAYER 1 KEYS
			player1Up: this.game.input.keyboard.addKey(Phaser.Keyboard.W), 
			player1Down: this.game.input.keyboard.addKey(Phaser.Keyboard.S), 
			player1Left: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
			player1Right: this.game.input.keyboard.addKey(Phaser.Keyboard.D),
			player1Reload: this.game.input.keyboard.addKey(Phaser.Keyboard.R),
			player1Pistol: this.game.input.keyboard.addKey(Phaser.Keyboard.ONE),
			player1AK: this.game.input.keyboard.addKey(Phaser.Keyboard.TWO),
			player1Shotgun: this.game.input.keyboard.addKey(Phaser.Keyboard.THREE),
			player1Build: this.game.input.keyboard.addKey(Phaser.Keyboard.E),		
			player1GrabBrain: this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR),		

			//PLAYER 2 KEYS
			player2Up: this.game.input.keyboard.addKey(Phaser.Keyboard.UP), 
			player2Down: this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN), 
			player2Left: this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT), 
			player2Right: this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT), 
			player2Reload: this.game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_ADD), 
			player2Pistol: this.game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_7), 
			player2AK: this.game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_8), 
			player2Shotgun: this.game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_9), 
			player2Build: this.game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_6),	
			player2GrabBrain: this.game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_0),

			retry: this.game.input.keyboard.addKey(Phaser.Keyboard.R),
		};
	},	

	createWeapon: function(type,nextFire,fireRate,magazine,numberOfBullets,damage,actualMagazine,maxAmmo,speed,angle){
		var weapon = {
			name : type,
			nextFire : nextFire,
			fireRate : fireRate,
			magazineCapacity : magazine,
			numberOfBullets : numberOfBullets,
			damage : damage,
			actualMagazine : actualMagazine,
			maxAmmo : maxAmmo,

			speed : speed,
			angle : angle
		}
		return weapon;
	},

	//-----------------UPDATE METHODS-----------------
	update: function(){
		this.allowEnemyAttack();

		for(var i = 0; i < this.playersCount; i++){
			
			this.players[i].body.velocity.x = 0;
			this.players[i].body.velocity.y = 0;
					
			//Shooting and building		
			if(!this.players[i].holdingBrain && !this.players[i].dead){
				if(!this.players[i].building){
					this.handleShooting(this.players[i]);		
				} else {
					this.handleBuilding(this.players[i]);
				}
			}		

			if(this.players[i].holdingBrain){
				this.brain.position.x = this.players[i].position.x;
				this.brain.position.y = this.players[i].position.y;
			}
			
			if(this.players[i].holdingBrain){
				this.brain.position.x = this.players[i].position.x;
				this.brain.position.y = this.players[i].position.y;
			}

			//Player movement
			this.players[i].rotation = this.game.physics.arcade.angleToPointer(this.players[i]);	
		}		

		//Handle inputs		
		if(this.game.input.keyboard.isDown){	
			this.handleKeyboardInput();
		}
		
		this.updateText();
		this.playerPushed();
		this.handleRound();

		//Collisions
		this.game.physics.arcade.collide(this.players, this.collisionLayer);
		//this.game.physics.arcade.collide(this.enemies, this.collisionLayer);
		this.spritesOverlapSolve();


		//Finds a path from enemy to player and updates its position			
		for(var i = 0; i < this.enemies.length; i++){
			this.moveEnemy(this.enemies[i]);			
		}
	
	},
	//Updates an enemy position
	updateEnemy: function(enemy){		
		var nextPosition, velocity;		
		if(enemy.path.length > 0){
			nextPosition = enemy.path[enemy.pathStep];			
			if(!this.reachedTargetPosition(nextPosition, enemy)){
				enemy.rotation = this.game.physics.arcade.angleBetween(enemy, nextPosition);		
				velocity = new Phaser.Point(nextPosition.x - enemy.position.x, nextPosition.y - enemy.position.y);
				velocity.normalize();
				enemy.body.velocity.x = velocity.x * enemy.walkingSpeed;
				enemy.body.velocity.y = velocity.y * enemy.walkingSpeed;				
			} else {
				enemy.rotation = this.game.physics.arcade.angleBetween(enemy, nextPosition);
				enemy.position.x = nextPosition.x;
				enemy.position.y = nextPosition.y;
				if(enemy.pathStep < enemy.path.length - 1){
					enemy.pathStep += 1;
				} else {
					enemy.path = [];
					enemy.pathStep = -1;
					enemy.body.velocity.x = 0;
					enemy.body.velocity.y = 0;
				}
			}			
		}
		if(enemy.targetBuilding!= null){
			if(Phaser.Point.distance(enemy.position, enemy.targetBuilding.position) < 20 && enemy.attackAvaible){
				this.damageBuilding(enemy.targetBuilding, enemy);		
				enemy.attackAvaible = false;			
			}
		}
	},	
	
	updateText: function(){
		switch(this.players[0].weapon){
			case "pistol":
				this.reloadTextPlayer1.setText("Pistola P1:" + this.players[0].pistol.actualMagazine + "/" + this.players[0].pistolActualAmmo);
				break;

			case "shotgun":
				this.reloadTextPlayer1.setText("Escopeta P1:" + this.players[0].shotgun.actualMagazine + "/" + this.players[0].shotgunActualAmmo);
				break;

			case "ak":
				this.reloadTextPlayer1.setText("AK P1:" + this.players[0].ak.actualMagazine + "/" + this.players[0].akActualAmmo);
				break;
		}

		switch(this.players[1].weapon){
			case "pistol":
				this.reloadTextPlayer2.setText("Pistola P1:" + this.players[1].pistol.actualMagazine + "/" + this.players[1].pistolActualAmmo);
				break;

			case "shotgun":
				this.reloadTextPlayer2.setText("Escopeta P1:" + this.players[1].shotgun.actualMagazine + "/" + this.players[1].shotgunActualAmmo);
				break;

			case "ak":
				this.reloadTextPlayer2.setText("AK P1:" + this.players[1].ak.actualMagazine + "/" + this.players[1].akActualAmmo);
				break;
		}

		if(this.players[0].reloading == true){
			this.reloadTextPlayer1.setText("RECARGANDO");
		} 	
		
		if(this.players[1].reloading == true){
			this.reloadTextPlayer2.setText("RECARGANDO");
		} 
		
		//Texto vida de los jugadores
		this.hpTextPlayer1.setText("HP P1:" + this.players[0].actualHp + "/" + this.players[0].hp);
		this.hpTextPlayer2.setText("HP P2:" + this.players[1].actualHp + "/" + this.players[1].hp);

		//Texto ronda actual
		this.actualRoundText.setText("Ronda actual:" + this.actualRound)

		//Texto del drop
		if(this.dropComing == true && this.resting == true && this.actualRound > 0){
			this.dropText.setText("Next drop in: " + this.dropTime);
		}else if(this.dropComing == false && this.resting == true && this.actualRound > 0){
			this.dropText.setText("TE QUEDASTE SIN DROP");
		}else{
			this.dropText.setText("No caen durante la ronda" + this.dropTime);
		}
		
		
		for(i = 0; i < this.playersCount;i++){ //Texto de los recursos de los jugadores
			this.players[i].resourceText.setText("Recursos jugador " + (i+1) + ": " + this.players[i].resources);
		}
		

		if(this.resting == true){
			this.restTimerText.setText("Countdown: "+this.timeBetweenRounds);
		}

	},

	//----------ROUND LOOP METHODS--------------
	startRound: function(){
		if(this.timeBetweenRounds > 0){
			this.timeBetweenRounds -= 1;
			this.restTimer.add(1000, this.startRound, this);
			
		}else{ //Empieza la ronda cuando se acaba el tiempo de descanso
			this.restTimer.pause();
			this.restTimer.add(1000, this.startRound, this);
			this.resting = false; 
			for(var i = 0; i < this.zombiesPerRound ; i++){
				var zombie = this.createEnemy(150 + (i * 100), 30 + (i * 100), 'zombie');
			}

		}
	},

	handleRound: function(){
		if(this.enemies.length == 0 && this.resting == false){ //Si no quedan enemigos -> Empieza el tiempo de descanso
			this.resting = true; 
			this.timeBetweenRounds = 3;
			this.zombiesPerRound++;
			this.restTimer.resume();
			this.actualRound++;
			
			this.dropProbability = this.game.rnd.integerInRange(0,100);
			this.dropTime = this.game.rnd.integerInRange(0,5);

			if(this.dropProbability <= 100){ // % de probabilidades de que caigan los drops
				this.dropComing = true;
				this.dropTimer.resume();
			}else{
				this.dropComing = false;
			}
		}

	},

	//-----------------METHODS-----------------
	//Calculates the enemy target position and calls find path
	moveEnemy: function(enemy){
		if(enemy.target == "player"){
			var targetPosition;		
			targetPosition = new Phaser.Point(this.player.position.x, this.player.position.y);		
			this.findPath(enemy.position, targetPosition, this.assignPath, enemy);	
		} else {
			enemy.target = "building";
			this.findPathToBuilding(enemy);
		}
	},		
	

	//----------ROUND LOOP METHODS--------------

	//----------RANDOM METHODS--------------
	//Handles the keyboard input
	handleKeyboardInput: function(){

		//----------------------PLAYER 1-----------------------
		//Movement
		if(this.actionKeys.player1Left.isDown){	
			this.players[0].body.velocity.x -= this.players[0].speed;
		}
		else if(this.actionKeys.player1Right.isDown){	
			this.players[0].body.velocity.x += this.players[0].speed;
		}
		if(this.actionKeys.player1Up.isDown){	
			this.players[0].body.velocity.y -= this.players[0].speed;
		}		
		else if(this.actionKeys.player1Down.isDown){
			this.players[0].body.velocity.y += this.players[0].speed;
		}

		//Reload
		if(this.actionKeys.player1Reload.isDown){
			this.players[0].reloading = true;
			this.players[0].reloadTimer.resume();
		}

		//Weapons inventory
		if(this.actionKeys.player1Pistol.isDown){
			this.players[0].weapon = 'pistol';
		} else if(this.actionKeys.player1AK.isDown){
			this.players[0].weapon = 'ak';
		} else if(this.actionKeys.player1Shotgun.isDown){
			this.players[0].weapon = 'shotgun';
		}

		//Change player state to building
		if(this.actionKeys.player1Build.isDown){
			if(!this.players[0].buildKeyJustPressed){
				this.players[0].building = !this.players[0].building;
				this.players[0].buildKeyJustPressed = true;					
				if(this.players[0].building){
					this.startBuilding(this.players[0]);
					console.log("Building");
				} else {
					this.endBuilding(this.players[0]);
				}
			}		
		}

		if(this.actionKeys.player1Build.isUp){
			this.players[0].buildKeyJustPressed = false;						
		}

		//Grab brain
		if(this.actionKeys.player1GrabBrain.isDown){
			if(!this.players[0].grabBrainKeyJustPressed){
				this.players[0].holdingBrain = !this.players[0].holdingBrain;
				this.players[0].grabBrainKeyJustPressed = true;		
				if(this.players[0].holdingBrain){					
					this.grabBrain(this.players[0]);
					console.log("grabbing brain");
				} else {					
					this.releaseBrain(this.players[0]);
				}
			}	
		}

		if(this.actionKeys.player1GrabBrain.isUp){
			this.players[0].grabBrainKeyJustPressed = false;			
		}
		//----------------------PLAYER 2-----------------------
		//Movement
		if(this.actionKeys.player2Left.isDown){	
			this.players[1].body.velocity.x -= this.players[1].speed;
		}
		else if(this.actionKeys.player2Right.isDown){	
			this.players[1].body.velocity.x += this.players[1].speed;
		}
		if(this.actionKeys.player2Up.isDown){	
			this.players[1].body.velocity.y -= this.players[1].speed;
		}		
		else if(this.actionKeys.player2Down.isDown){
			this.players[1].body.velocity.y += this.players[1].speed;
		}

		//Reload
		if(this.actionKeys.player2Reload.isDown){
			this.players[1].reloading = true;
			this.players[1].reloadTimer.resume();
		}

		//Weapons inventory
		if(this.actionKeys.player2Pistol.isDown){
			this.players[1].weapon = 'pistol';
		} else if(this.actionKeys.player2AK.isDown){
			this.players[1].weapon = 'ak';
		} else if(this.actionKeys.player2Shotgun.isDown){
			this.players[1].weapon = 'shotgun';
		}

		//Change player state to building
		if(this.actionKeys.player2Build.isDown){
			if(!this.players[1].buildKeyJustPressed){
				this.players[1].building = !this.players[1].building;
				this.players[1].buildKeyJustPressed = true;		
				if(this.players[1].building){
					this.startBuilding(this.players[1]);
				} else {
					this.endBuilding(this.players[1]);
				}
			}		
		}

		if(this.actionKeys.player2Build.isUp){
			this.buildKeyJustPressed = false;			
		}

		//Grab brain
		if(this.actionKeys.player2GrabBrain.isDown){
			if(!this.players[1].grabBrainKeyJustPressed){
				this.players[1].holdingBrain = !this.players[1].holdingBrain;
				this.players[1].grabBrainKeyJustPressed = true;		
				if(this.players[1].holdingBrain){					
					this.grabBrain(this.players[1]);
				} else {					
					this.releaseBrain(this.players[1]);
				}
			}	
		}

		if(this.actionKeys.player1GrabBrain.isUp){
			this.players[1].grabBrainKeyJustPressed = false;					
		}
	},

	//Creates an enemy
	createEnemy: function(x, y, texture){
		var zombie = this.game.add.sprite(x, y, texture); 
		this.game.physics.arcade.enable(zombie);
		//zombie.scale.setTo(0.05);
		zombie.anchor.setTo(0.5, 0.5);
		zombie.pathFindingAvaible = true;
		zombie.walkingSpeed = 70;
		zombie.body.collideWorldBounds = true;
		zombie.path = [];
		zombie.target = "player"
		zombie.targetBuilding;
		zombie.pathStep = -1;	
		zombie.hp = 10;	
		zombie.attackSpeed = 1;
		zombie.attackAvaible = true;	
		zombie.actualHp = zombie.hp;	
		zombie.damage = 5;
		zombie.pos = this.enemyCount;
		this.enemies[this.enemyCount] = zombie;		
		this.enemyCount++;
	},


	//Sprite gets killed when colliding with other
	spriteKill: function(player,sprite){
		sprite.kill();
		player.weapon = sprite.name;
		player.actualAmmo = sprite.magazine;
	},


	//----------PHYSICS METHODS--------------
	//Recognize a colision between sprites
	spritesOverlapSolve: function(){
		this.game.physics.arcade.overlap(this.enemies, this.brain, this.gameOver, null, this); //Colision entre los enemigos y el cerebro

		for(h = 0; h < this.players.length;h++){ //Bucle para colision entre jugadores y drop
			for(g = 0; g < this.drops.length;g++){
				this.game.physics.arcade.collide(this.players[h],this.drops[g],this.playerDropColision,null,this);
			}
		}

		for(i = 0; i < this.enemyCount;i++){ //Bucle para colision entre enemigos y disparos
			for(j = 0; j < this.shot.length;j++){
				this.game.physics.arcade.collide(this.shot[j], this.enemies[i], this.bulletZombieColision,null,this);
				this.game.physics.arcade.overlap(this.shot[j], this.enemies[i], this.bulletZombieColision,null,this);
			}
			
		}

		for(k = 0; k < this.players.length;k++){ //Bucle para colision entre enemigos y jugadores
			for(v  = 0;v < this.enemyCount;v++){
				this.game.physics.arcade.collide(this.players[k], this.enemies[v], this.playerZombieColision,null,this);
			}
		}

	},

	playerZombieColision: function(player,zombie){
		player.beingPushed = true;
		var playerPush = this.game.physics.arcade.velocityFromRotation(zombie.rotation); //Calculamos la velocidad para empujar al jugador a partir de la rotación del zombie

		player.actualHp -= zombie.damage;
		if(player.actualHp <= 0){
			player.kill();
			player.dead = true;
			this.gameOver();
		}
		player.vectorPush = playerPush;
		player.zombiePushing = zombie;
	},

	bulletZombieColision: function(shot,zombie){
		zombie.actualHp -= shot.damage;
		shot.kill();

		if(zombie.actualHp <= 0){
			zombie.kill();
			this.enemyCount--;
			if(this.enemyCount > 0){
				var newEnemies = [this.enemyCount]; //Array auxiliar
				for(var i = 0;i < zombie.pos;i++){
					newEnemies[i] = this.enemies[i];
				}
				for(var j = zombie.pos; j < this.enemyCount;j++){
					newEnemies[j] = this.enemies[j+1];
					newEnemies[j].pos--;		
				}	
				this.enemies = newEnemies;
			}else{
				this.enemies.length = 0; //Vaciamos el array
			}		
		}
	},
	
	playerPushed: function(){
		if(this.players[0].beingPushed == true && this.game.physics.arcade.distanceBetween(this.players[0], this.players[0].zombiePushing) < 20){
			this.players[0].body.velocity.setTo(this.players[0].vectorPush.x *6 , this.players[0].vectorPush.y *6);	
		}else{
			this.players[0].beingPushed = false;
		}
	},

	playerDropColision: function(player,drop){
		player.shotgunActualAmmo += drop.shotgunAmmo;
		player.akActualAmmo += drop.akAmmo;
		player.resources += drop.resources;
		drop.kill();

	},		
	
	//-----------------SHOOTING METHODS-----------------
	fire: function(weapon, player){
		if (this.game.time.now > weapon.nextFire && this.bullets.countDead() > 0)
   		{
        	weapon.nextFire = this.game.time.now + weapon.fireRate;	
			this.shot[weapon.numberOfBullets] = this.bullets.getFirstDead();
			this.shot[weapon.numberOfBullets].damage = weapon.damage;
        	this.shot[weapon.numberOfBullets].reset(player.x - 8, player.y - 8);
	       	this.game.physics.arcade.moveToPointer(this.shot[weapon.numberOfBullets], 300);

			if(weapon.name == "pistol"){
				player.pistol.actualMagazine -= weapon.numberOfBullets;
			}else{
				player.ak.actualMagazine -= weapon.numberOfBullets;
			}
			
			
    	}

	},

	fireMultiple: function(weapon, player){
		if (this.game.time.now > weapon.nextFire && this.bullets.countDead() > 0)
   		{
        	weapon.nextFire = this.game.time.now + weapon.fireRate;
			weapon.fireRate = 0;
			var j = -1;

			for(i = 0;i < weapon.numberOfBullets;i++){
			
				this.shot[i] = this.bullets.getFirstDead();
				this.shot[i].damage = weapon.damage;
				this.shot[i].reset(player.x - 8, player.y - 8);
				
				if(i == 0){
					var angle = this.game.physics.arcade.angleToPointer(this.shot[i]);
				}else{
					var angle = this.game.physics.arcade.angleToPointer(this.shot[i]) + (j * weapon.angle);
				}				
				this.shot[i].body.velocity.setToPolar(angle,weapon.speed);
				
				j = j*-1;
			}

			weapon.fireRate = 120;
			
			player.shotgun.actualMagazine -= weapon.numberOfBullets;
			
    	}

	},

	reloadMethod: function(player){	

		switch(player.weapon){
			
			case "pistol": //Hay municion infinita de pistola, siempre puede recargarse y siempre a tope
				player.pistol.actualMagazine = player.pistol.magazineCapacity;;
				break;

			case "shotgun":
			var bulletsLeft;
			if(player.shotgunActualAmmo != 0){ //Si tenemos balas, recargamos
				if(player.shotgun.actualMagazine + player.shotgunActualAmmo < player.shotgun.magazineCapacity){
					bulletsLeft = player.shotgunActualAmmo;
					player.shotgun.actualMagazine += bulletsLeft;
					player.shotgunActualAmmo -= bulletsLeft;
				} else {
					bulletsLeft = player.shotgun.magazineCapacity - player.shotgun.actualMagazine; //Calculamos cuantas balas nos hacen falta recargar
					player.shotgunActualAmmo -= bulletsLeft;
					player.shotgun.actualMagazine += bulletsLeft;					
				}
			}
			break;

			case "ak":
			var bulletsLeft;
			if(player.akActualAmmo != 0){ //Si tenemos balas, recargamos
				if(player.ak.actualMagazine + player.akActualAmmo < player.ak.magazineCapacity){
					bulletsLeft = player.akActualAmmo;
					player.ak.actualMagazine += bulletsLeft;
					player.akActualAmmo -= bulletsLeft;
				} else {
					bulletsLeft = player.ak.magazineCapacity - player.ak.actualMagazine; //Calculamos cuantas balas nos hacen falta recargar
					player.akActualAmmo -= bulletsLeft;
					player.ak.actualMagazine += bulletsLeft;					
				}
			}


			break;
				
		
		}
		
		player.reloadTimer.pause();
		player.reloadTimer.add(2000, this.reloadMethod, this, player);
		player.reloadTimer.start();
		player.reloadTimer.pause();
		//this.updateText();
		player.reloading = false; //Reseteamos el estado de recarga del jugador
	},

	handleShooting: function(player){	
		
			switch(player.weapon){
				case "pistol":
					if (this.game.input.activePointer.isDown && player.pistol.actualMagazine > 0 && player.reloading == false)
					{		
						this.fire(player.pistol, player);
						
					} else if(this.game.input.activePointer.isDown && player.pistol.actualMagazine > 0){ //Reloading
						player.reloading = true;
						player.reloadTimer.resume();
					}
					break;

				case "shotgun":
					if (this.game.input.activePointer.isDown && player.shotgun.actualMagazine > 0 && player.reloading == false)
					{
						this.fireMultiple(player.shotgun, player);
						
					} else if(this.game.input.activePointer.isDown && player.shotgun.actualMagazine > 0){ //Reloading
						player.reloading = true;
						player.reloadTimer.resume();
					}
					break;

				case "ak":
					if (this.game.input.activePointer.isDown && player.ak.actualMagazine > 0 && player.reloading == false)
					{
						this.fire(player.ak, player);
						
					} else if(this.game.input.activePointer.isDown && player.ak.actualMagazine > 0){ //Reloading
						player.reloading = true;
						player.reloadTimer.resume();
					}
					break;
			}      	
   		
	},


	//-----------------PATHFINDING METHODS-----------------
	//Inits pathfinding
	//Calculates the enemy target position and calls find path
	moveEnemy: function(enemy, ){
		if(this.brain != null){
			var minDistance = Number.POSITIVE_INFINITY, tmp;
			for(var i = 0; i < this.playersCount; i++){
				if(Phaser.Point.distance(enemy.position, this.brain.position) < Phaser.Point.distance(enemy.position, this.players[i].position)){
					enemy.target = "brain";
				} else {					
					if(Phaser.Point.distance(enemy.position, this.brain.position) >= Phaser.Point.distance(enemy.position, this.players[i].position)){
						enemy.target = "player";					
					}					
				}
			}

			for(var i = 0; i < this.playersCount; i++){
				tmp = Phaser.Point.distance(enemy.position, this.players[i].position);	
				if(tmp < minDistance){
					minDistance = tmp;
				}
			}

			if(Phaser.Point.distance(enemy.position, this.brain.position) < minDistance){
				enemy.target = "brain";
			} else {
				enemy.target = "player";
			}
		}		

		var targetPosition, targetPlayer;	
		if(enemy.target == "player"){	
			//Checks which player is closer
			minDistance = Number.POSITIVE_INFINITY;	
			for(var i = 0; i < this.playersCount; i++){
				tmp = Phaser.Point.distance(enemy.position, this.players[i].position);	
				if(tmp < minDistance){
					minDistance = tmp;
				}
			}

			for(var i = 0; i < this.playersCount; i++){
				tmp = Phaser.Point.distance(enemy.position, this.players[i].position);	
				if(tmp == minDistance){
					targetPlayer = this.players[i];
				}
			}

			targetPosition = new Phaser.Point(targetPlayer.position.x, targetPlayer.position.y);		
			this.findPath(enemy.position, targetPosition, this.assignPath, enemy);	
		} else if (enemy.target == "building") {			
			this.findPathToBuilding(enemy);
		} else if (enemy.target == "brain"){				
			targetPosition = new Phaser.Point(this.brain.position.x, this.brain.position.y);		
			this.findPath(enemy.position, targetPosition, this.assignPath, enemy);	
		}
	},
	
	initPathfinding: function(){
		this.gridIndices = [];
		
		for(var i = 0; i < this.levelDimensions.rows; i++){
			this.gridIndices[i] = [this.levelDimensions.columns];
			for(var j = 0; j < this.levelDimensions.columns; j++){
				this.gridIndices[i][j] = this.map.layers[1].data[j][i].index;
			}
		}

		this.easyStar.setGrid(this.gridIndices);
		this.easyStar.setAcceptableTiles([-1]);
		this.easyStar.enableDiagonals();
	},
	
	//Converts a grid position to a grid coordinate
	getCoordFromPosition: function(position){
		var row, column;
		row = Math.floor(position.y / this.tileDimensions.x);
		column = Math.floor(position.x / this.tileDimensions.y);
		return {row: row, column: column};
	}, 

	//Converts a grid coordinate to a grid position
	getPositionFromCoord: function(coord){
		var x, y;
		x = (coord.column * this.tileDimensions.x) + (this.tileDimensions.x / 2);
		y = (coord.row * this.tileDimensions.y) + (this.tileDimensions.y / 2);
		return new Phaser.Point(x, y);
	},	

	//Returns if the coordinate is outside the grid
	outsideGrid: function(coord){
		return coord.row < 0 || coord.row > this.levelDimensions.rows - 1 || coord.column < 0 || coord.column > this.levelDimensions.columns - 1;
	},

	//Creates an array with all the path positions in path
	callbackFunction: function(callback, enemy, path){
		var pathPositions = [];
		if(enemy.target == "player"){
			if(path !== null){			
				//A path to the player was found
				path.forEach(function(pathCoord){
					pathPositions.push(this.getPositionFromCoord({row: pathCoord.x, column: pathCoord.y}));
				}, this);

				callback.call(enemy, pathPositions, enemy);	
				this.updateEnemy(enemy);			
			} else {	
				//Couldn't find a path to the player	
				if(enemy.targetBuilding == null){					
					enemy.target = "building";			
					this.findPathToBuilding(enemy);		
				}			
			}
		} else {
			if(path !== null){		
				//A path to the building was found
				path.forEach(function(pathCoord){
					pathPositions.push(this.getPositionFromCoord({row: pathCoord.x, column: pathCoord.y}));
				}, this);
	
				callback.call(enemy, pathPositions, enemy);	
				this.updateEnemy(enemy);				
			}
		}
			
	},				


	//Finds a path to a building instead of the player
	findPathToBuilding: function(enemy){		
		var minDistance = Number.MAX_SAFE_INTEGER;
		for(var i = 0; i < this.destructableBuildingsCount; i++){
			var distance = Phaser.Point.distance(enemy.position, this.destructableBuildings[i].position);
			if(distance < minDistance){
				minDistance = distance;
				enemy.targetBuilding = this.destructableBuildings[i];
				break;
			}
		}	

		var x = enemy.targetBuilding.coordinates.column;
		var y = enemy.targetBuilding.coordinates.row;
		var originalIndex = this.map.layers[1].data[y][x].index			

		if(enemy.targetBuilding != null){
			this.map.layers[1].data[y][x].index = -1;
			this.initPathfinding();
			this.findPath(enemy.position, enemy.targetBuilding.position, this.assignPath, enemy);		
			this.map.layers[1].data[y][x].index = originalIndex;
			this.initPathfinding();
		}		
	},

	//Returns if the subject has reached the target position
	reachedTargetPosition: function(targetPosition, subject){
		var distance;
		distance = Phaser.Point.distance(subject.position, targetPosition);
		return distance < 1;
	},

	//Finds a path from an origin to a target
	findPath: function(originPosition, targetPosition, callback, enemy){		

		if(enemy.pathFindingAvaible || enemy.target == "building"){
			var originCoord = this.getCoordFromPosition(originPosition);
			var targetCoord = this.getCoordFromPosition(targetPosition);

			if(!this.outsideGrid(originCoord) && !this.outsideGrid(targetCoord)){			
				this.easyStar.findPath(originCoord.row, originCoord.column, targetCoord.row, targetCoord.column, this.callbackFunction.bind(this, callback, enemy));			
				this.easyStar.calculate();		
				this.updateText(targetPosition, enemy);	
				enemy.pathFindingAvaible = false;
				return true;				
			} else {
				return false;
			}
		} else {
			this.updateEnemy(enemy);
		}	
	},

	//Assigns a path to an enemy
	assignPath: function(path, enemy){
		if(path !== null){
			enemy.path = path;
			enemy.pathStep = 1;
		} else {
			this.path = [];			
		}
		
	},

	allowPathfinding: function(){
		for(var i = 0; i<this.enemyCount; i++){
			this.enemies[i].pathFindingAvaible = true;
		}
	},

	//-----------------BUILDING METHODS-----------------
	startBuilding: function(player){
		var vectorPlayerPointer;		

		vectorPlayerPointer = {
			x: this.game.input.mousePointer.worldX - player.position.x,
			y: this.game.input.mousePointer.worldY - player.position.y
		};

		vectorPlayerPointer = this.normalize(vectorPlayerPointer);

		player.wallPointer = this.game.add.sprite(0.1 * vectorPlayerPointer.x, 0.1 * vectorPlayerPointer.y, 'wallTile');
		player.wallPointer.anchor.setTo(0.5, 0.5);
		player.wallPointer.alpha = 0.6;	
	},

	handleBuilding: function(player){
		var vectorPlayerPointer, buildingCell, buildingPointer;
		var distanceToPlayer = 30;		

		vectorPlayerPointer = {
			x: this.game.input.mousePointer.worldX - player.position.x,
			y: this.game.input.mousePointer.worldY - player.position.y
		};

		vectorPlayerPointer = this.normalize(vectorPlayerPointer);

		buildingPointer = {
			x: player.position.x + vectorPlayerPointer.x * distanceToPlayer,
			y: player.position.y + vectorPlayerPointer.y * distanceToPlayer
		};			
		
		buildingCell = this.getCoordFromPosition(buildingPointer);

		player.wallPointer.position.x = buildingCell.column * this.tileDimensions.x + this.tileDimensions.x * 0.5;
		player.wallPointer.position.y = buildingCell.row * this.tileDimensions.y + this.tileDimensions.y * 0.5;	

		player.wallPointer.isAbleToBuild = true;

		if(buildingCell.row < 0) buildingCell.row = 0;
		if(buildingCell.row > 49) buildingCell.row = 49;
		if(buildingCell.column < 0) buildingCell.column = 0;
		if(buildingCell.column > 49) buildingCell.column = 49;

		if(this.map.layers[1].data[buildingCell.row][buildingCell.column].index != -1){
			isAbleToBuild = false;
			player.wallPointer.loadTexture('redWallTile', 0);
		} else {
			isAbleToBuild = true;
			player.wallPointer.loadTexture('wallTile', 0);
		}
		
		if(this.game.input.activePointer.isDown && isAbleToBuild){	
			this.build(buildingCell, player.wallPointer);				
		}
		
	},

	endBuilding:function(player){
		player.wallPointer.kill();
		player.building = false;
	},

	//Returns a vector normalized
	normalize: function(vector){
		var norm = vector.x * vector.x + vector.y * vector.y;
		norm = Math.sqrt(norm);
	
		return{x: vector.x / norm, y: vector.y / norm};
	},

	build: function(buildingCell, wallPointer){
		if(this.player.resources > 0){
			var position = {x: wallPointer.position.x - this.tileDimensions.x * 0.5, y:  wallPointer.position.y - this.tileDimensions.y * 0.5};
			wall = this.game.add.sprite(position.x, position.y, 'wallTile');
			wall.coordinates = {
				row: buildingCell.row,
				column: buildingCell.column
			}
			wall.hits = 1;
			this.destructableBuildingsCount++;
			wall.pos = this.destructableBuildingsCount;
			this.map.layers[1].data[wall.coordinates.row][wall.coordinates.column].index = 99;		
			this.initPathfinding();
			this.setCollisionLayer();
			this.destructableBuildings[this.destructableBuildingsCount - 1] = wall;

			this.player.resources-= this.buildCost;
		}else{
			this.notEnoughResourcesText = this.game.add.text(250, 250, "NO TIENES RECURSOS SUFICIENTES", { font: "20px Arial", fill: "#FF0000", align: "center" });
		}
		
	},

	setCollisionLayer: function(){
		this.map.setCollisionBetween(1, 100, true, 'collisionLayer');
	},	

	damageBuilding: function(building, enemy){	
		building.kill();	
		this.destructableBuildingsCount--;
		this.reorganizeArray(this.destructableBuildings, this.destructableBuildingsCount, building);
		enemy.targetBuilding = null;
		enemy.target = "player";			
	},

	allowEnemyAttack: function(){
		for(var i = 0; i < this.enemies.length; i++){
			this.enemies[i].attackAvaible = true;	
		}
	},

	reorganizeArray: function(array, count, object){
		if(array.length > 0){
			var newArray = [this.count];
			for (var i = 0; i < object.pos; i++){
				newArray[i] = array[i];
			}

			for (var j = 0; j < count; j++){
				newArray[j] = array[j+1];
				newArray[j].pos--;
			}
		} else {
			array.length = 0;
		}
		return newArray;
	},

	//--------------DROP METHODS------------------
	createDrop: function(){

		
		for(i = 0; i < this.playersCount;i++){
			if(this.drops[i] != null){
				this.drops[i].kill();
			}
		}

		if(this.dropTime > 0){

			this.dropTime -= 1;
			this.dropTimer.add(1000, this.createDrop, this);

		}else{
	
			for(i = 0; i < this.playersCount;i++){
				var dropPos = this.createDropCoords();
				this.drops[i] = this.game.add.sprite(dropPos.x, dropPos.y, 'drop');
				
				this.drops[i].shotgunAmmo = this.game.rnd.integerInRange(0,this.players[0].shotgun.magazineCapacity * 2);
				while(this.drops[i].shotgunAmmo % 3 != 0){ //A la escopeta siempre le damos balas multiplos de 3
					this.drops[i].shotgunAmmo = this.game.rnd.integerInRange(0,this.players[0].shotgun.magazineCapacity * 2);
				}
				this.drops[i].akAmmo = this.game.rnd.integerInRange(0,this.players[0].ak.magazineCapacity * 2);
				this.drops[i].resources = this.game.rnd.integerInRange(0,20);
				this.game.physics.arcade.enable(this.drops[i]);
			}

			this.dropTimer.pause();
			this.dropTimer.add(1000, this.createDrop, this);

		}
	},

	createDropCoords: function(){
		var dropPos = {x: 0, y: 0};
		dropPos.x = this.game.rnd.integerInRange(0,this.levelDimensions.columns * this.tileDimensions.x);
		dropPos.y = this.game.rnd.integerInRange(0,this.levelDimensions.rows * this.tileDimensions.y);
		
		// 19 / 22 -> Río

		dropCoord = this.getCoordFromPosition(dropPos);

		if(this.gridIndices[dropCoord.row][dropCoord.column]  != -1){ //Si es distinto de -1 (-1 = tierra), si tocamos rio volvemos a llamar la funcion
			return dropPos = this.createDropCoords();
		}else{
			return dropPos;
		}

	},

	//-----------------BRAIN METHODS-----------------
	grabBrain: function(player){
		if(Phaser.Point.distance(player, this.brain.position) < 26){
			player.speed = 50;			
			return;
		}		
		player.holdingBrain = false;
	},

	releaseBrain: function(player){		
		this.brain.position.x = player.position.x - 8;		
		this.brain.position.y = player.position.y - 8;		

		player.speed = 200;
		player.holdingBrain = false;
	},

	gameOver: function(){
		console.log("Unlucky game over");				
		/*this.game.add.text(this.levelDimensions.columns * this.tileDimensions.x / 2 - 300, this.levelDimensions.rows * this.tileDimensions.y / 2 - 200, "GAME OVER", { font: "100px Arial", fill: "#993333", align: "center" });
		this.game.paused = true;*/
	},
}	
