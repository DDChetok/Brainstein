var Brainstein = Brainstein || {};
Brainstein.Game = function(){};

Brainstein.Game = {		
	//#region [ rgba (0, 205, 30, 0.1) ] CONSTRUCTOR METHODS
	init: function(){
		this.levelSelected = Brainstein.LevelSelection.levelSelected;
	},

	create: function(){
		this.createLevel();

		//-----------------PLAYER VARIABLES-----------------
		//Create player
		this.players = [];
		this.playersCount = 0;
		this.createPlayer(100, 150, 'erwin');	
		this.createPlayer(150, 250, 'darwin');			

		this.resurrectTimer = this.game.time.create(false);	
		//-----------------WEAPON VARIABLES-----------------
		//Bullets and reload
	
		this.bullets = this.game.add.group(); 
		this.bullets.enableBody = true;
   		this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
		this.bullets.createMultiple(50, 'bullet');
		this.bullets.setAll('anchor.x', 0.5);
		this.bullets.setAll('anchor.y', 0.5);
    	this.bullets.setAll('checkWorldBounds', true);
		this.bullets.setAll('outOfBoundsKill', true);		

		////-----------------ENEMIES VARIABLES-----------------
		//Enemies
		this.enemies = [];
		this.enemyCount = 0;		

		//-----------------PATHFINDING VARIABLES-----------------
		this.easyStar = new EasyStar.js();
		this.initPathfinding();		

		//Optimization
		this.enemyHordeLenght = 1;
		this.lastEnemyUpdated = -1;
		this.hordeTimer = this.game.time.create(false);
		this.hordeTimer.add(250,this.createHorde, this);
		this.hordeTimer.start();
		this.hordeTimer.pause();

		this.game.time.events.repeat(Phaser.Timer.SECOND * 0.25, Number.POSITIVE_INFINITY, this.allowPathfinding, this);
		//-----------------ADITIONAL VARIABLES-----------------
		//Create action keys
		this.actionKeys = this.createKeys();
			
		//-----------------ARROW VARIABLES-----------------
		this.arrow = this.game.add.sprite(this.game.width / 2, this.game.height / 2, "arrow");
		this.arrow.fixedToCamera = true;
		this.arrow.width = this.game.height / 2;
		this.arrow.anchor.setTo(0, 0.5);

		//-----------------CAMERA VARIABLES-----------------	
		this.game.camera.follow(this.players[0], Phaser.Camera.FOLLOW_LOCKON, 0.05, 0.05);			
		this.camera.target = this.players[0];
		this.game.time.desiredFps = 30;

		//-----------------ROUND LOOP VARIABLES-----------------
		this.timeBetweenRounds = 3; //Tiempo entre rondas(numero)
		
		this.restTimer = this.game.time.create(false); //Timer entre rondas(objeto timer)
		this.restTimer.add(1000, this.startRound, this);
		this.restTimer.start(); //EMPIEZA LA RONDA 1
		
		this.zombiesPerRound = 1;
		this.resting = true;
		this.actualRound = 0;		
		//----------------DROPS-------------------
		this.dropTime = this.game.rnd.integerInRange(0,5);

		this.drops = [];

		this.dropTimer = this.game.time.create(false);
		this.dropTimer.add(1000,this.createDrop, this);
		this.dropTimer.start();
		this.dropTimer.pause();		

		//-----------------BRAIN VARIABLES-----------------
		this.brain = this.game.add.sprite(180, 180, "brain");
		this.brain.anchor.setTo(0.5, 0.5);
		this.brain.width = 64;
		this.brain.height = 64;
		this.game.physics.arcade.enable(this.brain);	

		//-----------------TEXTS VARIABLES-----------------
		this.reloadTextPlayer1 = this.game.add.text(0, 0, " ", { font: "20px Chakra Petch", fill: "#000", align: "center" });		
		this.reloadTextPlayer1.anchor.setTo(0.5, 0.5);
		this.reloadTextPlayer2 = this.game.add.text(this.game.width - 400, 0, " ", { font: "20px Chakra Petch", fill: "#000", align: "center" });	
		this.reloadTextPlayer2.anchor.setTo(0.5, 0.5);

		this.actualRoundText = this.game.add.text(this.game.width / 2, 20, "Ronda actual:", { font: "20px Chakra Petch", fill: "#0a2239", align: "center" });
		this.actualRoundText.anchor.setTo(0.5, 0.5);
		this.actualRoundText.fixedToCamera = true;	
		this.actualRoundNumberText = this.game.add.text(this.game.width / 2, 60, this.actualRound, { font: "50px Chakra Petch", fill: "#0a2239", align: "center" });
		this.actualRoundNumberText.anchor.setTo(0.5, 0.5);
		this.actualRoundNumberText.fixedToCamera = true;	
		
		this.restTimerText = this.game.add.text(this.game.width / 2, 100, this.timeBetweenRounds, { font: "20px Chakra Petch", fill: "#1d84b5", align: "center" });
		this.restTimerText.anchor.setTo(0.5, 0.5)
		this.restTimerText.fixedToCamera = true;	
	},

	createLevel: function(){

		//Create Tiled map & spawnPoints
		this.spawnPoints = [];
		this.spawnPointsCount = 0;				

		switch(this.levelSelected){
			case 0:			
				this.map = this.game.add.tilemap('level1');	
		
			break;
			case 1:			
				this.map = this.game.add.tilemap('level2');				
			break;
			case 2:
				this.map = this.game.add.tilemap('level3');					
			break;
		}

		//The first parameter is the tileset name as specified in Tiled, the second is the key to the asset
		this.map.addTilesetImage('tilesheet_complete_2X', 'gameTiles');
		this.levelDimensions = {rows: this.map.layers[1].data.length, columns: this.map.layers[1].data[0].length};
		this.tileDimensions = {x: this.map.tileWidth, y: this.map.tileHeight};

		//Creates SpawnPoints
		switch(this.levelSelected){
			case 0:					
				//Level spawnPoints
				this.createSpawnPoint(21 * this.tileDimensions.x, 20 * this.tileDimensions.y);
				this.createSpawnPoint(42 * this.tileDimensions.x, 11 * this.tileDimensions.y, 500);
				this.createSpawnPoint(750, 32);
		
			break;
			case 1:						
				//Level spawnPoints
				this.createSpawnPoint(32, 500);
				this.createSpawnPoint(750, 500);
				this.createSpawnPoint(750, 32);
			break;
			case 2:			
				//Level spawnPoints
				this.createSpawnPoint(32, 32);	
			break;
		}
		
		//Create map layers
		this.backgroundLayer = this.map.createLayer('backgroundLayer');
		this.collisionLayer = this.map.createLayer('collisionLayer');
		this.backgroundLayer2 = this.map.createLayer('backgroundLayer2');

		//Mejora el movimiento de la cámara
		this.backgroundLayer.renderSettings.enableScrollDelta = true;
		this.collisionLayer.renderSettings.enableScrollDelta = true;
		this.backgroundLayer2.renderSettings.enableScrollDelta = true;

		//Collision on blockedLayer
		this.map.setCollisionBetween(1, 5000, true, 'collisionLayer');

		//Resizes the game world to match the layer dimensions
		this.backgroundLayer.resizeWorld();		
		this.backgroundLayer2.resizeWorld();	

		this.camera.flash('#000000');

		this.game.physics.startSystem(Phaser.Physics.ARCADE);
	},

	createPlayer: function(x, y, sprite){
		var player = this.game.add.sprite(x, y, sprite);
		player.width = 64;
		player.height = 64;
		player.anchor.setTo(0.25, 0.5);
		player.hp = 30;
		player.actualHp = player.hp;
		player.weapon = "pistol";	
		player.pistolActualAmmo = Number.POSITIVE_INFINITY;
		player.shotgunActualAmmo = 0;
		player.akActualAmmo = 0;

		player.pistol = this.createWeapon("pistol",0,400,12,1,5,12,Number.POSITIVE_INFINITY,700,0);
		player.shotgun = this.createWeapon("shotgun",0,600,12,3,8,12,50,700,0.25);
		player.ak = this.createWeapon("ak",0,50,30,1,8,20,200,700,0);

		player.reloadTimer = this.game.time.create(false);
		player.reloadTimer.add(1000, this.reloadMethod, this,player);
		player.reloadTimer.start();
		player.reloadTimer.pause();	
			
		player.reloading = false;
		player.holdingBrain = false;			
		player.speed = 200;
		player.beingPushed = false;	
		player.grabBrainKeyJustPressed = false;
		player.dead = false;
		player.resurrecting = false;
		player.resurrectText = this.game.add.text(player.position.x, player.position.y + 20, " ", { font: "30px Chakra Petch", fill: "#0a2239", align: "center" })
		player.resurrectText.anchor.setTo(0.5, 0.5);

		player.shot = [];
		player.actualShot = 0;

		player.dropCatchedText = this.game.add.text(player.x, player.y - 50, " " , { font: "15px Chakra Petch", fill: "#081346", align: "center" });
		player.dropCatchedText.anchor.setTo(0.5, 0.5);
		player.dropCatchedTimer = this.game.time.create(false);
		player.dropCatchedTimer.add(2000,this.deleteDropText,this,player);
		player.dropCatchedTimer.start();
		player.dropCatchedTimer.pause();	

		player.nextEnemyHitTimer = this.game.time.create(false);
		player.nextEnemyHitTimer.add(500,this.resetPlayerHitbox,this,player);
		player.nextEnemyHitTimer.start();
		player.nextEnemyHitTimer.pause();

		player.redHealthBar = this.game.add.image(player.x - 58, player.y - 60, 'redHealthBar');
		player.redHealthBar.width = 115;
		player.redHealthBar.height = 10;

		player.healthBar = this.game.add.image(player.x - 58, player.y - 60, 'healthBar');					
		player.healthBar.width = 115;
		player.healthBar.height = 10;	

		this.game.physics.arcade.enable(player);	
		player.body.collideWorldBounds = true;

		this.players[this.playersCount] = player;
		this.playersCount++;
		
	},

	//Creates an enemy
	createEnemy: function(texture){
		var zombie, x, y;
		var spawnPointIndex = this.game.rnd.integerInRange(0, this.spawnPointsCount -1); //Chooses the spawpoint it will appear in.
		x = this.spawnPoints[spawnPointIndex].position.x + this.game.rnd.integerInRange(-this.spawnPoints[spawnPointIndex].spawnArea, this.spawnPoints[spawnPointIndex].spawnArea) * this.tileDimensions.x;
		y = this.spawnPoints[spawnPointIndex].position.y + this.game.rnd.integerInRange(-this.spawnPoints[spawnPointIndex].spawnArea, this.spawnPoints[spawnPointIndex].spawnArea) * this.tileDimensions.y;
		zombie = this.game.add.sprite(x, y, texture); 	
		//zombie.height = 60;
		//zombie.width = 60;
		this.game.physics.arcade.enable(zombie);
		zombie.anchor.setTo(0.5, 0.5);
		zombie.pathFindingAvaible = true;
		zombie.walkingSpeed = 70;
		zombie.body.collideWorldBounds = true;
		zombie.path = [];
		zombie.target = "player"	
		zombie.pathStep = -1;	
		zombie.hp = 10;	
		zombie.attackSpeed = 1;
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
			player1GrabBrain: this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR),	
			player1Resurrect: this.game.input.keyboard.addKey(Phaser.Keyboard.F),	

			//PLAYER 2 KEYS
			player2Up: this.game.input.keyboard.addKey(Phaser.Keyboard.UP), 
			player2Down: this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN), 
			player2Left: this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT), 
			player2Right: this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT), 
			player2Reload: this.game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_ADD), 
			player2Pistol: this.game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_7), 
			player2AK: this.game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_8), 
			player2Shotgun: this.game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_9), 			
			player2GrabBrain: this.game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_0),
			player2Resurrect: this.game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_SUBTRACT),		
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

	createSpawnPoint: function(x, y){
		var spawnPoint = this.game.add.sprite(x, y);	
		spawnPoint.spawnArea = 3; //Cells around the spawnPoint

		this.spawnPoints[this.spawnPointsCount] = spawnPoint;
		this.spawnPointsCount++;
	},
	//#endregion

	//#region [ rgba (25, 50, 150, 0.1)] UPDATE METHODS
	update: function(){
		for(var i = 0; i < this.playersCount; i++){			
			this.players[i].body.velocity.x = 0;
			this.players[i].body.velocity.y = 0;
					
			//Shooting and building		
			if(!this.players[i].holdingBrain && !this.players[i].dead && !this.players[i].resurrecting){
				this.handleShooting(this.players[i]);
			}		

			if(this.players[i].holdingBrain){
				this.brain.position.x = this.players[i].position.x;
				this.brain.position.y = this.players[i].position.y;
			}

			//Player movement
			if(!this.players[i].dead){
				this.players[i].rotation = this.game.physics.arcade.angleToPointer(this.players[i]);	
			}			

		}		

		//Handle inputs		
		if(this.game.input.keyboard.isDown){	
			this.handleKeyboardInput();
		}
		
		this.updateText();		
		this.handleRound();

		//Collisions				
		this.collisionsAndOverlaps();

		//Checks if the OTHER player is dead
		if(Phaser.Point.distance(this.players[0].position, this.players[1].position) < 30 && this.players[1].dead && !this.players[0].dead){
			this.players[0].resurrectText.setText("Press F to resurrect");
			if(this.actionKeys.player1Resurrect.isDown){	
				this.players[0].resurrecting = true;
				this.resurrectTimer.add(3500, this.resurrectPlayer, this, this.players[1],this.players[0]);	
				this.resurrectTimer.start();	
				this.players[0].resurrectText.setText(Math.floor(this.resurrectTimer.duration/1000) + 1);		
			} else {
				this.resurrectTimer.stop();
				this.players[0].resurrecting = false;
			}
		} else {
			this.players[0].resurrectText.setText(" ");
		}		

		if(Phaser.Point.distance(this.players[0].position, this.players[1].position) < 30 && this.players[0].dead && !this.players[1].dead){
			this.players[1].resurrectText.setText("Press - to resurrect");
			if(this.actionKeys.player2Resurrect.isDown){
				this.players[1].resurrecting = true;						
				this.resurrectTimer.add(3500, this.resurrectPlayer, this, this.players[0],this.players[1]);	
				this.resurrectTimer.start();	
				this.players[1].resurrectText.setText(Math.floor(this.resurrectTimer.duration/1000));		
			} else {
				this.resurrectTimer.stop();
				this.players[1].resurrecting = false;
			}				
		} else {
			this.players[1].resurrectText.setText(" ");
		}	

		//Finds a path from enemy to player and updates its position			
		for(var i = 0; i < this.enemies.length; i++){
			this.moveEnemy(this.enemies[i]);			
		}

		//Updates arrow rotation
		if(Phaser.Point.distance(this.camera.target.position, this.brain.position) < this.game.height / 2||
		   Phaser.Point.distance(this.camera.target.position, this.brain.position) < this.game.width / 2){
			this.arrow.alpha = 0;			
		} else {
			this.arrow.alpha = 1;
			this.arrow.rotation = this.game.physics.arcade.angleBetween(this.arrow, this.brain);			
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
	},	
	
	updateText: function(){
		if(!this.players[0].dead){
			switch(this.players[0].weapon){
				case "pistol":
					this.reloadTextPlayer1.setText("Pistola:" + this.players[0].pistol.actualMagazine + "/Inf");
					this.reloadTextPlayer1.position.x = this.players[0].position.x;
					this.reloadTextPlayer1.position.y = this.players[0].position.y - 70;
					break;

				case "shotgun":
					this.reloadTextPlayer1.setText("Escopeta:" + this.players[0].shotgun.actualMagazine + "/" + this.players[0].shotgunActualAmmo);
					this.reloadTextPlayer1.position.x = this.players[0].position.x;
					this.reloadTextPlayer1.position.y = this.players[0].position.y - 70;
					break;

				case "ak":
					this.reloadTextPlayer1.setText("AK:" + this.players[0].ak.actualMagazine + "/" + this.players[0].akActualAmmo);
					this.reloadTextPlayer1.position.x = this.players[0].position.x;
					this.reloadTextPlayer1.position.y = this.players[0].position.y - 70;
					break;			
			}	

			if(this.players[0].reloading == true){
				this.reloadTextPlayer1.setText("RECARGANDO");				
			} 	
		}else{
			this.reloadTextPlayer1.setText("");			
		}

		if(!this.players[1].dead){
			switch(this.players[1].weapon){
				case "pistol":
					this.reloadTextPlayer2.setText("Pistola:" + this.players[1].pistol.actualMagazine + "/Inf");
					this.reloadTextPlayer2.position.x = this.players[1].position.x;
					this.reloadTextPlayer2.position.y = this.players[1].position.y - 70;
					break;

				case "shotgun":
					this.reloadTextPlayer2.setText("Escopeta:" + this.players[1].shotgun.actualMagazine + "/" + this.players[1].shotgunActualAmmo);
					this.reloadTextPlayer2.position.x = this.players[1].position.x;
					this.reloadTextPlayer2.position.y = this.players[1].position.y - 70;
					break;

				case "ak":
					this.reloadTextPlayer2.setText("AK:" + this.players[1].ak.actualMagazine + "/" + this.players[1].akActualAmmo);
					this.reloadTextPlayer2.position.x = this.players[1].position.x;
					this.reloadTextPlayer2.position.y = this.players[1].position.y - 70;
					break;
			}		
			
			if(this.players[1].reloading == true){
				this.reloadTextPlayer2.setText("RECARGANDO");
			} 
		}else{
			this.reloadTextPlayer2.setText("");		
		}	

		//Texto ronda actual
		this.actualRoundNumberText.setText(this.actualRound+1);
		
		for(i = 0; i < this.playersCount; i++){

			//Textos de los drops
			this.players[i].dropCatchedText.x = this.players[i].x;
			this.players[i].dropCatchedText.y = this.players[i].y - 100;			

			//Health Bars
			this.players[i].healthBar.x = this.players[i].x - 58;
			this.players[i].healthBar.y = this.players[i].y - 60;		

			this.players[i].redHealthBar.x = this.players[i].x - 58;
			this.players[i].redHealthBar.y = this.players[i].y - 60;
			
			//Resurrect Text
			if(!this.players[i].resurrecting){
				this.players[i].resurrectText.position.x = this.players[i].position.x;
				this.players[i].resurrectText.position.y = this.players[i].position.y + 50;	
			} else {
				this.players[i].resurrectText.position.x = this.players[i].position.x;
				this.players[i].resurrectText.position.y = this.players[i].position.y + 50;	
			}	
		}		

		if(this.resting == true){
			this.restTimerText.setText(this.timeBetweenRounds);
		} else {
			this.restTimerText.setText("");
		}

	},

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
			this.players[0].loadTexture('erwin');
		} else if(this.actionKeys.player1AK.isDown){
			this.players[0].weapon = 'ak';
			this.players[0].loadTexture('erwinAk');
		} else if(this.actionKeys.player1Shotgun.isDown){
			this.players[0].weapon = 'shotgun';	
			this.players[0].loadTexture('erwinShotgun');	
		}

		//Grab brain
		if(this.actionKeys.player1GrabBrain.isDown){
			if(!this.players[0].grabBrainKeyJustPressed){
				this.players[0].holdingBrain = !this.players[0].holdingBrain;
				this.players[0].grabBrainKeyJustPressed = true;		
				if(this.players[0].holdingBrain){					
					this.grabBrain(this.players[0]);					
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
			this.players[1].loadTexture('darwin');
		} else if(this.actionKeys.player2AK.isDown){
			this.players[1].weapon = 'ak';
			this.players[1].loadTexture('darwinAk');
		} else if(this.actionKeys.player2Shotgun.isDown){
			this.players[1].weapon = 'shotgun';		
			this.players[1].loadTexture('darwinShotgun');
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
	//#endregion

	//#region [ rgba (200, 0, 200, 0.1)] ROUND LOOP METHODS
	startRound: function(){
		if(this.timeBetweenRounds > 0){
			this.timeBetweenRounds -= 1;
			this.restTimer.add(1000, this.startRound, this);
			
		}else{ //Empieza la ronda cuando se acaba el tiempo de descanso
			this.restTimer.pause();	
			this.restTimer.add(1000, this.startRound, this);		
			this.resting = false; 			
	
			this.createHorde();
				if(this.enemies.length < this.zombiesPerRound){
					this.game.time.events.repeat(Phaser.Timer.SECOND * 0.50, Math.ceil(this.zombiesPerRound / this.enemyHordeLenght)-1 , this.createHorde, this);			
				}
			}
	},

	handleRound: function(){
		if(this.enemyCount == 0 && this.resting == false){ //Si no quedan enemigos -> Empieza el tiempo de descanso
			this.resting = true; 
			this.timeBetweenRounds = 3;
			this.zombiesPerRound++;
			this.restTimer.resume();
			this.actualRound++;
			
			this.dropProbability = this.game.rnd.integerInRange(0,100);
			this.dropTime = this.game.rnd.integerInRange(0,5);

			if(this.dropProbability <= 100){ // % de probabilidades de que caigan los drops
				this.dropTimer.resume();
			}

			this.teleportBrain();
		}

	},

	createHorde: function(){
		for(var j = 0; j < this.enemyHordeLenght ; j++){
				this.createEnemy('zombie');				
		}			
	
	},
	//#endregion
	
	//#region [rgba (0, 200, 200, 0.1)] PHYSICS METHODS
	//Recognize a colision between sprites
	collisionsAndOverlaps: function(){
		this.game.physics.arcade.overlap(this.enemies, this.brain, this.gameOver, null, this);
		this.game.physics.arcade.collide(this.players, this.enemies, this.playerZombieColision,null,this);
		this.game.physics.arcade.collide(this.players,this.drops,this.playerDropColision,null,this);	
		this.game.physics.arcade.collide(this.players, this.collisionLayer);			

		for(i = 0; i < this.playersCount;i++){
			this.game.physics.arcade.overlap(this.players[i].shot, this.enemies, this.bulletZombieColision,null,this);
			this.game.physics.arcade.collide(this.players[i].shot, this.collisionLayer, this.bulletCollsionLayerCollision,null,this);
		}		
		
	},

	resetPlayerHitbox: function(player){
		
		player.beingPushed = false;
		player.nextEnemyHitTimer.pause();
		player.nextEnemyHitTimer.add(500,this.resetPlayerHitbox,this,player);
	},

	playerZombieColision: function(player,zombie){
		if(player.beingPushed == false){
			player.beingPushed = true;
			var playerPush = this.game.physics.arcade.velocityFromRotation(zombie.rotation); //Calculamos la velocidad para empujar al jugador a partir de la rotación del zombie
			player.actualHp -= zombie.damage;
			this.healthBarPercent(player, player.actualHp / 30)
				if(player.actualHp <= 0){
					this.killPlayer(player);		
				}
			player.vectorPush = playerPush;
			player.zombiePushing = zombie;
			player.nextEnemyHitTimer.resume();
		}	
	},

	bulletZombieColision: function(shot,zombie){
		zombie.actualHp -= shot.damage;
		shot.kill();

		if(zombie.actualHp <= 0){
			zombie.kill();
			this.enemyCount--;
			this.lastEnemyUpdated = -1;
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
	
	/*playerPushed: function(){
		for(i = 0;i < this.players.length; i++){
			if(this.players[i].beingPushed == true && this.game.physics.arcade.distanceBetween(this.players[i], this.players[i].zombiePushing) < 20){
				this.players[i].body.velocity.setTo(this.players[i].vectorPush.x *100 , this.players[i].vectorPush.y *100);	
			}else{
				this.players[i].beingPushed = false;
			}
		}
		
	},*/

	playerDropColision: function(player,drop){
		drop.kill();
		player.shotgunActualAmmo += drop.shotgunAmmo;
		player.akActualAmmo += drop.akAmmo;
		player.resources += drop.resources;
		player.actualHp += drop.health;
		if(player.actualHp > 30) player.actualHp = 30;
		this.healthBarPercent(player, player.actualHp / 30);
		player.dropCatchedTimer.resume();
		player.dropCatchedText.setText(drop.shotgunAmmo + " Balas escopeta\n" + drop.akAmmo + " Balas AK");
	},

	bulletCollsionLayerCollision: function(bullet){
		bullet.kill();
	},
	
	//Sprite gets killed when colliding with other
	spriteKill: function(player,sprite){
		sprite.kill();
		player.weapon = sprite.name;
		player.actualAmmo = sprite.magazine;
	},

	healthBarPercent: function(player, percent){			
		player.healthBar.width = 115 * percent;
	},
	//#endregion		
	
	//#region [rgba(200, 200, 0, 0.1)] SHOOTING METHODS
	fire: function(weapon, player){
		if (this.game.time.now > weapon.nextFire && this.bullets.countDead() > 0)
   		{
        	weapon.nextFire = this.game.time.now + weapon.fireRate;	
			player.shot[player.actualShot] = this.bullets.getFirstDead();
			player.shot[player.actualShot].damage = weapon.damage;
			if(weapon.name == "pistol"){
				var x, y;
				x = player.position.x + (30 * Math.cos(player.rotation));
				y = player.position.y + (30 * Math.sin(player.rotation));
				player.shot[player.actualShot].reset(x, y);
			}else if(weapon.name == "ak"){
				var x, y;
				x = player.position.x + (50 * Math.cos(player.rotation));
				y = player.position.y + (50 * Math.sin(player.rotation));
				player.shot[player.actualShot].reset(x, y);
			}
	       	this.game.physics.arcade.moveToPointer(player.shot[player.actualShot], weapon.speed);

			player.actualShot++;

			if(player.actualShot >= player.ak.maxAmmo){
				player.actualShot = 0;
			}

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
			
				player.shot[i] = this.bullets.getFirstDead();
				player.shot[i].damage = weapon.damage;

				var x, y;
				x = player.position.x + (50 * Math.cos(player.rotation));
				y = player.position.y + (50 * Math.sin(player.rotation));
				player.shot[i].reset(x, y);
				
				if(i == 0){
					var angle = this.game.physics.arcade.angleToPointer(player.shot[i]);
				}else{
					var angle = this.game.physics.arcade.angleToPointer(player.shot[i]) + (j * weapon.angle);
				}				
				player.shot[i].body.velocity.setToPolar(angle,weapon.speed);
				
				j = j*-1;
			}

			weapon.fireRate = 600;
			
			player.shotgun.actualMagazine -= weapon.numberOfBullets;
			
    	}

	},

	reloadMethod: function(player){	

		switch(player.weapon){
			
			case "pistol": //Hay municion infinita de pistola, siempre puede recargarse y siempre a tope
				player.pistol.actualMagazine = player.pistol.magazineCapacity; 
				break;

			case "shotgun":
			var bulletsLeft;
			if(player.shotgunActualAmmo != 0){ //Si tenemos balas, recargamos
				//Si las las balas en el cargador + tu reserva de balas es < que la capacidad del cargador -> SI NO PUEDES RELLENAR TODO EL CARGADOR
				if(player.shotgun.actualMagazine + player.shotgunActualAmmo < player.shotgun.magazineCapacity){ 
					bulletsLeft = player.shotgunActualAmmo;
					player.shotgun.actualMagazine += bulletsLeft;
					player.shotgunActualAmmo -= bulletsLeft;
				} else { //SI PUEDES RELLENAR TODO EL CARGADOR
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

		player.reloading = false; //Reseteamos el estado de recarga del jugador
	},

	handleShooting: function(player){			
			switch(player.weapon){
				case "pistol":
					if (this.game.input.activePointer.isDown && player.pistol.actualMagazine > 0 && player.reloading == false)
					{		
						this.fire(player.pistol, player);
						
					} else if(this.game.input.activePointer.isDown && player.pistol.actualMagazine <= 0){ //Reloading
						player.reloading = true;
						player.reloadTimer.resume();
					}
					break;

				case "shotgun":
					if (this.game.input.activePointer.isDown && player.shotgun.actualMagazine > 0 && player.reloading == false)
					{
						this.fireMultiple(player.shotgun, player);
						
					} else if(this.game.input.activePointer.isDown && player.shotgun.actualMagazine <= 0 && player.akActualAmmo > 0){ //Reloading
						player.reloading = true;
						player.reloadTimer.resume();
					}
					break;

				case "ak":
					if (this.game.input.activePointer.isDown && player.ak.actualMagazine > 0 && player.reloading == false)
					{
						this.fire(player.ak, player);
						
					} else if(this.game.input.activePointer.isDown && player.ak.actualMagazine <=  0 && player.shotgunActualAmmo > 0){ //Reloading
						player.reloading = true;
						player.reloadTimer.resume();
					}
					break;
			}      	
   		
	},
	//#endregion

	//#region [rgba(0, 0, 200, 0.1)] PATHFINDING METHODS
	//Inits pathfinding
	//Calculates the enemy target position and calls find path
	moveEnemy: function(enemy){
		if(this.brain != null){
			//Checks what is closer, a player or the brain
			var minDistance = Number.POSITIVE_INFINITY, spawnPointIndex;
			for(var i = 0; i < this.playersCount; i++){
				if(Phaser.Point.distance(enemy.position, this.brain.position) < Phaser.Point.distance(enemy.position, this.players[i].position)){
					enemy.target = "brain";
				} else {	
					enemy.target = "player";									
				}
			}	
			
			//Checks if all players are dead		
			var allDead = true;	
			for(var i = 0; i < this.playersCount; i++){
				if(!this.players[i].dead){
					allDead = false;
				}
			}	

			if(allDead) enemy.target = "brain";
		}		

		var targetPosition, targetPlayer;	
		if(enemy.target == "player"){	
			//Checks which player is closer
			minDistance = Number.POSITIVE_INFINITY;	
			for(var i = 0; i < this.playersCount; i++){
				if(!this.players[i].dead){
					var distance = Phaser.Point.distance(enemy.position, this.players[i].position);	
					if(distance < minDistance){
						minDistance = distance;
					}
				}
			}

			for(var j = 0; j < this.playersCount; j++){
				if(!this.players[j].dead){
					var distance = Phaser.Point.distance(enemy.position, this.players[j].position);	
					if(distance == minDistance){
						targetPlayer = this.players[j];
					}
				}
			}

			targetPosition = new Phaser.Point(targetPlayer.position.x, targetPlayer.position.y);		
			this.findPath(enemy.position, targetPosition, this.assignPath, enemy);			
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
				this.gridIndices[i][j] = this.map.layers[2].data[j][i].index;
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
		if(path !== null){			
			//A path to the player was found
			path.forEach(function(pathCoord){
				pathPositions.push(this.getPositionFromCoord({row: pathCoord.x, column: pathCoord.y}));
			}, this);

			callback.call(enemy, pathPositions, enemy);	
			this.updateEnemy(enemy);			
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

		if(enemy.pathFindingAvaible){
			var originCoord = this.getCoordFromPosition(originPosition);
			var targetCoord = this.getCoordFromPosition(targetPosition);

			if(!this.outsideGrid(originCoord) && !this.outsideGrid(targetCoord)){			
				this.easyStar.findPath(originCoord.row, originCoord.column, targetCoord.row, targetCoord.column, this.callbackFunction.bind(this, callback, enemy));			
				this.easyStar.calculate();						
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

	//Allows pathfinding to a horde of enemies
	allowPathfinding: function(){
		if(this.enemyCount != 0){			

			if(this.lastEnemyUpdated >= this.enemyCount - 1){							
				this.lastEnemyUpdated = -1;
				this.allowPathfinding();
			} else {
				if(this.lastEnemyUpdated + this.enemyHordeLenght > this.enemyCount){
					for(var i = 0; i < this.enemyCount; i++){
						this.enemies[this.lastEnemyUpdated + 1].pathFindingAvaible = true;
						if(this.lastEnemyUpdated + 1 >= this.enemyCount - 1){
							this.lastEnemyUpdated = -1;
							return;
						}
						this.lastEnemyUpdated++;
					}
				} else {
					for(var i = 0; i < this.enemyHordeLenght; i++){
						this.enemies[this.lastEnemyUpdated + 1].pathFindingAvaible = true;
						if(this.lastEnemyUpdated + 1 >= this.enemyCount - 1){
							this.lastEnemyUpdated = -1;
							return;
						}
						this.lastEnemyUpdated++;
					}
				}				
			}
		}		
	},
	//#endregion

	//#region [rgba(200, 0, 0, 0.1)] DROP METHODS
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
				var dropPos = {
					x: 100,
					y: 100
				}//this.createDropCoords();
				this.drops[i] = this.game.add.sprite(dropPos.x, dropPos.y, 'drop');
				this.drops[i].width = 60;
				this.drops[i].height = 60;
				
				this.drops[i].shotgunAmmo = this.game.rnd.integerInRange(0,this.players[0].shotgun.magazineCapacity * 2);
				while(this.drops[i].shotgunAmmo % 3 != 0){ //A la escopeta siempre le damos balas multiplos de 3
					this.drops[i].shotgunAmmo = this.game.rnd.integerInRange(0,this.players[0].shotgun.magazineCapacity * 2);
				}
				this.drops[i].akAmmo = this.game.rnd.integerInRange(0,this.players[0].ak.magazineCapacity * 2);
				this.drops[i].health = this.game.rnd.integerInRange(5, 15)	
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

		if(this.gridIndices[dropCoord.column][dropCoord.row]  != -1){ //Si es distinto de -1 (-1 = tierra), si tocamos rio volvemos a llamar la funcion
			return dropPos = this.createDropCoords();
		}else{
			return dropPos;
		}

	},

	deleteDropText: function(player){
		player.dropCatchedTimer.pause();
		player.dropCatchedText.setText("");
		player.dropCatchedTimer.add(2000,this.deleteDropText,this,player);
	},
		//#endregion

	//#region [rgba(100, 100, 100, 0.1)] BRAIN METHODS
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

	teleportBrain: function(){
		for(var i = 0; i < this.playersCount; i++){
			this.players[i].holdingBrain = false;
			this.players[i].speed = 200;
		}
		var brainPos = {x: 0, y: 0};
		brainPos.x = this.game.rnd.integerInRange(0,this.levelDimensions.columns * this.tileDimensions.x);
		brainPos.y = this.game.rnd.integerInRange(0,this.levelDimensions.rows * this.tileDimensions.y);		

		var randomCell = this.getCoordFromPosition(brainPos);

		if(this.gridIndices[randomCell.column][randomCell.row] != -1){
			this.teleportBrain();
		} else {
			this.brain.position.x = brainPos.x;
			this.brain.position.y = brainPos.y;
		}
	},
	//#endregion
	
	//#region [rgba(362, 100, 82, 0.1)] GAME OVER METHODS
	gameOver: function(){	
		/*this.game.camera.follow(this.brain, Phaser.Camera.FOLLOW_LOCKON, 0.05, 0.05);			
		this.camera.fade('#ff0000', 3000);
		this.camera.onFadeComplete.add(this.fadeComplete, this);*/

	},

	fadeComplete: function(){
		this.state.start('GameOver');
	},
	//#endregion

	//#region [rgba(90, 0, 90, 0.1)] DEATH & RESURRECTION METHODS
	killPlayer: function(player){
		player.dead = true;
		player.body.enable = false;
		player.loadTexture('deadPlayer');	

		//Checks if all players are dead
		var gameOver = true;
		for(var i = 0; i < this.playersCount; i++){
			if(!this.players[i].dead){
				gameOver = false;
			}
		}

		if(this.players[0].dead){
			this.game.camera.follow(this.players[1], Phaser.Camera.FOLLOW_LOCKON, 0.05, 0.05);
			this.camera.target = this.players[1];	
		} else {
			this.game.camera.follow(this.players[0], Phaser.Camera.FOLLOW_LOCKON, 0.05, 0.05);	
			this.camera.target = this.players[0];
		}

		if(gameOver) this.gameOver();
	},

	resurrectPlayer: function(playerDead,playerAlive){
		playerDead.dead = false;
		playerDead.body.enable = true;
		playerDead.actualHp = playerDead.hp;
		playerDead.loadTexture('erwin');	

		playerAlive.resurrecting = false;

	},
	//#endregion
}
