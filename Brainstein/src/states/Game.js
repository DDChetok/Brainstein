var Brainstein = Brainstein || {};
Brainstein.Game = function(){};

Brainstein.Game = {
	//#region [ rgba (0, 205, 30, 0.1) ] CONSTRUCTOR METHODS
	init: function(){
		this.levelSelected = Brainstein.LevelSelection.levelSelected;
		this.game.mainMenuMusic.stop();
		this.game.pressEnterSound.stop();		
	},

	create: function(){
		this.createLevel();
		this.createCameraPositions();

		//-----------------SOUNDS-----------------
		this.backgroundMusic = this.game.add.audio('gameBackgroundMusic');
		this.backgroundMusic.loop = true;
		this.backgroundMusic.play();
		this.backgroundMusic.volume = 0.5;
		
		//-----------------TEMPORAL SPRITES-----------------
		this.temporalSprites = this.game.add.group();	
		this.alphaStep = 0.001;
		this.bloodPuddleSprites = ['bloodPuddle1', 'bloodPuddle2', 'bloodPuddle3'];

		//-----------------BRAIN VARIABLES-----------------
		this.brain = this.game.add.sprite(260, 240, "brain");
		this.brain.anchor.setTo(0.5, 0.5);
		this.brain.width = 64;
		this.brain.height = 64;
		this.game.physics.arcade.enable(this.brain);	

		this.grabBrainDistance = 60;

		//-----------------PLAYER VARIABLES-----------------
		//Create player
		this.players = [];
		this.createPlayer(300, 150, 'erwin');	
		this.createPlayer(150, 450, 'darwin');			

		this.resurrectTimer = this.game.time.create(false);	
		//-----------------WEAPON VARIABLES-----------------
		
		//Bullets and reload	
		this.bullets = this.game.add.group(); 
		this.bullets.enableBody = true;
   		this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
		this.bullets.createMultiple(50, 'bullet');
		this.bullets.setAll('anchor.x', 0);
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
		this.enemyHordeLenght = 5;
		this.lastEnemyUpdated = -1;
		this.hordeTimer = this.game.time.create(false);
		this.hordeTimer.add(250,this.createHorde, this);
		this.hordeTimer.start();
		this.hordeTimer.pause();

		this.game.time.events.repeat(Phaser.Timer.SECOND * 0.25, Number.POSITIVE_INFINITY, this.allowPathfinding, this);
			
		//-----------------ARROW VARIABLES-----------------
		this.arrow = this.game.add.sprite(this.game.width / 2, this.game.height / 2, "arrow");
	
		this.arrow.width = 150;
		this.arrow.height = 35;
		this.arrow.anchor.setTo(0, 0.5);
		this.arrow.position.x = this.players[0].position.x;
		this.arrow.position.y = this.players[0].position.y;

		//-----------------CAMERA VARIABLES-----------------		
		this.game.camera.target = null;
		this.game.time.desiredFps = 60;

		//-----------------ROUND LOOP VARIABLES-----------------
		this.timeBetweenRounds = 3; //Tiempo entre rondas(numero)
		
		this.restTimer = this.game.time.create(false); //Timer entre rondas(objeto timer)
		this.restTimer.add(1000, this.startRound, this);
		this.restTimer.start(); //EMPIEZA LA RONDA 1
		
		this.zombiesPerRound = 10;
		this.resting = true;
		this.actualRound = 0;		
		//----------------DROPS-------------------
		this.dropTime = 2;

		this.drops = [];
		
		this.maxDrops = 6;

		this.dropTimer = this.game.time.create(false);
		this.dropTimer.add(1000,this.createDrop, this);
		this.dropTimer.start();
		this.dropTimer.pause();		

		//-----------------TEXTS VARIABLES-----------------	
		this.actualRoundText = this.game.add.text(this.game.width / 2, 20, "Ronda actual:", { font: "20px Chakra Petch", fill: "#0a2239", align: "center" });
		this.actualRoundText.anchor.setTo(0.5, 0.5);
		this.actualRoundText.fixedToCamera = true;	
		this.actualRoundNumberText = this.game.add.text(this.game.width / 2, 60, this.actualRound, { font: "50px Chakra Petch", fill: "#0a2239", align: "center" });
		this.actualRoundNumberText.anchor.setTo(0.5, 0.5);
		this.actualRoundNumberText.fixedToCamera = true;	
		
		this.restTimerText = this.game.add.text(this.game.width / 2, 100, this.timeBetweenRounds, { font: "20px Chakra Petch", fill: "#00530b", align: "center" });
		this.restTimerText.anchor.setTo(0.5, 0.5)
		this.restTimerText.fixedToCamera = true;

		//-----------------PARTICLE VARIABLES-----------------
		this.emitter = this.game.add.emitter(0, 0, 100);
		this.emitter.makeParticles("bulletParticle");		
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
				this.createSpawnPoint(11 * this.tileDimensions.x, 19 * this.tileDimensions.y);
				this.createSpawnPoint(23 * this.tileDimensions.x, 28 * this.tileDimensions.y);
				this.createSpawnPoint(45 * this.tileDimensions.x, 26 * this.tileDimensions.y);
		
			break;
			case 1:						
				//Level spawnPoints
				this.createSpawnPoint(14 * this.tileDimensions.x, 4 * this.tileDimensions.y);				
				this.createSpawnPoint(16 * this.tileDimensions.x, 22 * this.tileDimensions.y);
			break;
			case 2:			
				//Level spawnPoints
				this.createSpawnPoint(22 * this.tileDimensions.x, 5 * this.tileDimensions.y);
				this.createSpawnPoint(22 * this.tileDimensions.x, 22 * this.tileDimensions.y);				
			break;
		}
		
		//Create map layers
		this.backgroundLayer = this.map.createLayer('backgroundLayer');
		this.backgroundLayer2 = this.map.createLayer('backgroundLayer2');
		this.collisionLayer = this.map.createLayer('collisionLayer');
		

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
		//Sprite variables
		var player = this.game.add.sprite(x, y, sprite);
		player.width = 64;
		player.height = 64;
		player.anchor.setTo(0.25, 0.5);

		//Player hp
		player.hp = 30;
		player.actualHp = player.hp;			

		//Shooting
		player.shot = [];
		player.actualShot = 0;
		//Player weapons		
		player.pistol = this.createWeapon("pistol",0,400,12,1,5,12,Number.POSITIVE_INFINITY,700,0);
		player.shotgun = this.createWeapon("shotgun",0,600,12,3,8,12,50,700,0.25);
		player.ak = this.createWeapon("ak",0,50,30,1,8,20,200,700,0);
		player.weapon = "pistol";	
		//Player ammo
		player.pistolActualAmmo = Number.POSITIVE_INFINITY;		
		player.shotgunActualAmmo = 2000;
		player.akActualAmmo = 2000;
		//Reloading
		player.reloadTimer = this.game.time.create(false);
		player.reloadTimer.add(1000, this.reloadMethod, this,player);
		player.reloadTimer.start();
		player.reloadTimer.pause();	
		//Shooting sprites		
		if(this.players.length == 0){
			player.sprites = ["erwin", "erwinAk", "erwinShotgun"];
		} else if(this.players.length == 1){
			player.sprites = ["darwin", "darwinAk", "darwinShotgun"];
		}

		//Player states
		player.reloading = false;
		player.holdingBrain = false;		
		player.beingPushed = false;	
		player.grabBrainKeyJustPressed = false;
		player.dead = false;
		player.resurrecting = false;		

		//Invulnerabilty after hit
		player.nextEnemyHitTimer = this.game.time.create(false);
		player.nextEnemyHitTimer.add(500,this.resetPlayerHitbox,this,player);
		player.nextEnemyHitTimer.start();
		player.nextEnemyHitTimer.pause();

		//Health bar
		player.redHealthBar = this.game.add.image(player.x - 58, player.y - 60, 'redHealthBar');
		player.redHealthBar.width = 115;
		player.redHealthBar.height = 10;
		player.healthBar = this.game.add.image(player.x - 58, player.y - 60, 'healthBar');					
		player.healthBar.width = 115;
		player.healthBar.height = 10;	

		//Physics
		player.originalSpeed = 400;	
		player.speed = player.originalSpeed;	
		this.game.physics.arcade.enable(player);	
		player.body.collideWorldBounds = true;
		
		//Texts
		//Reload text
		player.reloadTextPlayer = this.game.add.text(0, 0, " ", { font: "20px Chakra Petch", fill: "#000", align: "center" });		
		player.reloadTextPlayer.anchor.setTo(0.5, 0.5);
		//Drop Text & Text Timer
		player.dropCatchedText = this.game.add.text(player.x, player.y - 50, " " , { font: "15px Chakra Petch", fill: "#081346", align: "center" });
		player.dropCatchedText.anchor.setTo(0.5, 0.5);	
		player.dropCatchedTimer = this.game.time.create(false);
		player.dropCatchedTimer.add(2000,this.deleteDropText,this,player);
		player.dropCatchedTimer.start();
		player.dropCatchedTimer.pause();	
		//Resurrect Text
		player.resurrectText = this.game.add.text(player.position.x, player.position.y + 20, " ", { font: "30px Chakra Petch", fill: "#0a2239", align: "center" });
		player.resurrectText.anchor.setTo(0.5, 0.5);		
		//Grab Brain Text
		player.grabBrainText = this.game.add.text(player.position.x, player.position.y + 20, " ", { font: "30px Chakra Petch", fill: "#0a2239", align: "center" });
		player.grabBrainText.anchor.setTo(0.5, 0.5);	

		//Player keys
		player.keys = {};
		player.keys = this.createKeys();
		
		//Add the player to the array of players
		this.players[this.players.length] = player;		
	},

	//Creates an enemy
	createEnemy: function(texture){
		var zombie, x, y;
		var spawnPointIndex = this.game.rnd.integerInRange(0, this.spawnPointsCount -1); //Chooses the spawpoint it will appear in.
	
		//Choose random spawnpoint tile position
		x = this.spawnPoints[spawnPointIndex].tile.row * this.tileDimensions.y / 2; 
		y = this.spawnPoints[spawnPointIndex].tile.column * this.tileDimensions.x / 2;
		
		//Choose random tile around spawnpoint
		x += this.game.rnd.integerInRange(-this.spawnPoints[spawnPointIndex].spawnArea, this.spawnPoints[spawnPointIndex].spawnArea) * this.tileDimensions.x;
		y += this.game.rnd.integerInRange(-this.spawnPoints[spawnPointIndex].spawnArea, this.spawnPoints[spawnPointIndex].spawnArea) * this.tileDimensions.y;

		var tile = this.getCoordFromPosition({x, y});
		while(this.gridIndices[tile.column][tile.row] != -1){
			x = this.spawnPoints[spawnPointIndex].position.x + this.game.rnd.integerInRange(-this.spawnPoints[spawnPointIndex].spawnArea, this.spawnPoints[spawnPointIndex].spawnArea) * this.tileDimensions.x;
			y = this.spawnPoints[spawnPointIndex].position.y + this.game.rnd.integerInRange(-this.spawnPoints[spawnPointIndex].spawnArea, this.spawnPoints[spawnPointIndex].spawnArea) * this.tileDimensions.y;

			tile = this.getCoordFromPosition({x:x, y:y});
		}

		zombie = this.game.add.sprite(x, y, texture); 	
		zombie.height = 40;
		zombie.width = 40;
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
		if(this.players.length == 0){
			var keys =  {						
				Up: this.game.input.keyboard.addKey(Phaser.Keyboard.W), 
				Down: this.game.input.keyboard.addKey(Phaser.Keyboard.S), 
				Left: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
				Right: this.game.input.keyboard.addKey(Phaser.Keyboard.D),
				Reload: this.game.input.keyboard.addKey(Phaser.Keyboard.R),
				Pistol: this.game.input.keyboard.addKey(Phaser.Keyboard.ONE),
				AK: this.game.input.keyboard.addKey(Phaser.Keyboard.TWO),
				Shotgun: this.game.input.keyboard.addKey(Phaser.Keyboard.THREE),				
				GrabBrain: this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR),	
				Resurrect: this.game.input.keyboard.addKey(Phaser.Keyboard.F),	
			}	
		} else if(this.players.length == 1){
			var keys = {
				Up: this.game.input.keyboard.addKey(Phaser.Keyboard.UP), 
				Down: this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN), 
				Left: this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT), 
				Right: this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT), 
				Reload: this.game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_ADD), 
				Pistol: this.game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_7), 
				AK: this.game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_8), 
				Shotgun: this.game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_9), 			
				GrabBrain: this.game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_0),
				Resurrect: this.game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_SUBTRACT),	
			}
		} else if(this.players.length > 1){
			console.error("Too many players");
		}		
		
		return keys;
					
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
		spawnPoint.width = 1;
		spawnPoint.height = 1;
		spawnPoint.tile = this.getCoordFromPosition({x, y});
		spawnPoint.spawnArea = 2; //Cells around the spawnPoint

		this.spawnPoints[this.spawnPointsCount] = spawnPoint;
		this.spawnPointsCount++;
	},

	//Caculates camera positions depending on the size of the screen and the size of the level
	createCameraPositions(){		
		this.cameraPositions = [];	
		this.currentCameraPosition = 0;
	
		this.cameraXPositionsCount = Math.ceil((this.levelDimensions.columns * this.tileDimensions.x) / this.game.width);		
		this.cameraYPositionsCount = Math.ceil((this.levelDimensions.rows * this.tileDimensions.y) / this.game.height);

		var cameraPositionsX = [];		
		var cameraPositionsY = [];		

		var x1 = this.game.camera.position.x, y1 = this.game.camera.position.y, x2 = this.levelDimensions.columns * this.tileDimensions.x, y2 = this.levelDimensions.rows * this.tileDimensions.y;
		for(var i = 0 ; i < this.cameraXPositionsCount; i++){					
			cameraPositionsX[i] = x1 + (i / this.cameraXPositionsCount) * (x2 - x1);
		}

		for(var i = 0 ; i < this.cameraYPositionsCount; i++){			
			cameraPositionsY[i] = y1 + (i / this.cameraYPositionsCount) * (y2 - y1);
		}
			
		for(var y = 0, i = 0 ; y < this.cameraYPositionsCount; y++){					
			for(var x = 0 ; x < this.cameraXPositionsCount; x++, i++){			
				this.cameraPositions[i] = {
					x: cameraPositionsX[x],
					y: cameraPositionsY[y]
				}				
			}
		}		
	},
	//#endregion

	//#region [ rgba (25, 50, 150, 0.1)] UPDATE METHODS
	//Calls all the different update functions
	update: function(){	
		if(this.players.length > 1){	
			this.checkIfDeadPlayerNearby();		
		}	
		
		for(var i = 0; i < this.players.length; i++){			
			this.updatePlayer(this.players[i]);
		}

		this.handleKeyboardInput();	
		this.updateText();	
		this.updateTemporalSprites();	
		this.handleRound();				
		this.collisionsAndOverlaps();
		this.updateCamera();
		this.updateArrow();	

		//Finds a path from enemy to player and updates its position			
		for(var i = 0; i < this.enemies.length; i++){
			this.moveEnemy(this.enemies[i]);			
		}			
	},

	updatePlayer(player){
		player.body.velocity.x = 0;
		player.body.velocity.y = 0;
				
		//Shooting		
		if(this.game.input.activePointer.isDown){
			if(!player.holdingBrain && !player.dead && !player.resurrecting){
				this.handleShooting(player);
			}		
		}

		if(player.holdingBrain){						
			var x, y;
			x = player.position.x + (35 * Math.cos(player.rotation));
			y = player.position.y + (35 * Math.sin(player.rotation));

			this.brain.position.x = x;
			this.brain.position.y = y;
		}

		//Player movement
		if(!player.dead){
			player.rotation = this.game.physics.arcade.angleToPointer(player);	
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
	
	//Updates all the texts
	updateText: function(){
		//Texto ronda actual
		this.actualRoundNumberText.setText(this.actualRound+1);
		
		for(i = 0; i < this.players.length; i++){
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

			//Weapon & Ammo Text
			if(!this.players[i].dead){
				switch(this.players[i].weapon){
					case "pistol":
						this.players[i].reloadTextPlayer.setText("Pistola:" + this.players[i].pistol.actualMagazine + "/Inf");
						this.players[i].reloadTextPlayer.position.x = this.players[i].position.x;
						this.players[i].reloadTextPlayer.position.y = this.players[i].position.y - 70;
						break;
	
					case "shotgun":
						this.players[i].reloadTextPlayer.setText("Escopeta:" + this.players[i].shotgun.actualMagazine + "/" + this.players[0].shotgunActualAmmo);
						this.players[i].reloadTextPlayer.position.x = this.players[i].position.x;
						this.players[i].reloadTextPlayer.position.y = this.players[i].position.y - 70;
						break;
	
					case "ak":
						this.players[i].reloadTextPlayer.setText("AK:" + this.players[i].ak.actualMagazine + "/" + this.players[0].akActualAmmo);
						this.players[i].reloadTextPlayer.position.x = this.players[i].position.x;
						this.players[i].reloadTextPlayer.position.y = this.players[i].position.y - 70;
						break;			
				}	
	
				if(this.players[i].reloading == true){
					this.players[i].reloadTextPlayer.setText("RECARGANDO");				
				} 	
			}else{
				this.players[i].reloadTextPlayer.setText("");			
			}	
			
			//Grab Brain Text
			if(Phaser.Point.distance(this.players[i], this.brain.position) < this.grabBrainDistance && !this.players[i].holdingBrain){
				this.players[i].grabBrainText.position.x = this.players[i].position.x;
				this.players[i].grabBrainText.position.y = this.players[i].position.y + 50;
				this.players[i].grabBrainText.setText("Press space to grab");			
			} else {
				this.players[i].grabBrainText.setText(" ");			
			}
		}		

		if(this.resting == true){
			this.restTimerText.setText(this.timeBetweenRounds);
		} else {
			this.restTimerText.setText("");
		}

	},

	//Checks if the camera position should change
	updateCamera(){
		//Camera goes right
		if(this.currentCameraPosition + 1 < this.cameraPositions.length){
			if(this.cameraPositions[this.currentCameraPosition + 1].x != 0){ 		
				if(this.players[0].position.x >= this.camera.position.x + this.game.width){					
					this.currentCameraPosition++;
					this.game.camera.position = this.cameraPositions[this.currentCameraPosition];
				}
			} 
		}

		//Camera goes left
		if(this.currentCameraPosition > 0){		
			if(this.players[0].position.x < this.camera.position.x){		
				this.currentCameraPosition--;
				this.game.camera.position = this.cameraPositions[this.currentCameraPosition];
			}
		}

		//Camera goes up
		if(this.currentCameraPosition >= this.cameraXPositionsCount){						
			if(this.players[0].position.y < this.camera.position.y){		
				this.currentCameraPosition -= this.cameraXPositionsCount;	
				this.game.camera.position = this.cameraPositions[this.currentCameraPosition];		
	
			}
		}

		//Camera goes down
		if(this.currentCameraPosition + this.cameraXPositionsCount < this.cameraPositions.length){			
			if(this.players[0].position.y >= this.camera.position.y + this.game.height){				
				this.currentCameraPosition += this.cameraXPositionsCount;	
				this.game.camera.position = this.cameraPositions[this.currentCameraPosition];
			}
		}

	},

	//Updates arrow rotation & alpha
	updateArrow(){
		if(Phaser.Point.distance(this.players[0].position, this.brain.position) < 500){		   
			this.arrow.alpha = 0;			
		} else {
			this.arrow.alpha = 0.6;
			this.arrow.position = this.players[0].position;
			this.arrow.rotation = this.game.physics.arcade.angleBetween(this.arrow, this.brain);	
		}	
	},

	//Takes care of the temporal sprites
	updateTemporalSprites(){
		for(var i = 0; i < this.temporalSprites.children.length; i++){
			this.temporalSprites.children[i].alpha -= this.alphaStep;
			if(this.temporalSprites.children[i].alpha <= 0){
				this.temporalSprites.children[i].kill();
			}
		}
	},

	handleKeyboardInput: function(){
		for(var i = 0; i < this.players.length; i++){
			//Movement
			if(this.players[i].keys.Left.isDown){	
				this.players[i].body.velocity.x -= this.players[i].speed;
			}
			else if(this.players[i].keys.Right.isDown){	
				this.players[i].body.velocity.x += this.players[i].speed;
			}
			if(this.players[i].keys.Up.isDown){	
				this.players[i].body.velocity.y -= this.players[i].speed;
			}		
			else if(this.players[i].keys.Down.isDown){
				this.players[i].body.velocity.y += this.players[i].speed;
			}			


			//Reload
			if(this.players[i].keys.Reload.isDown){
				this.players[i].reloading = true;
				this.players[i].reloadTimer.resume();
			}

			//Weapons inventory
			if(this.players[i].keys.Pistol.isDown && !this.players[i].dead){
				this.players[i].weapon = 'pistol';
				this.players[i].loadTexture(this.players[i].sprites[0]);
			} else if(this.players[i].keys.AK.isDown && !this.players[i].dead){
				this.players[i].weapon = 'ak';
				this.players[i].loadTexture(this.players[i].sprites[1]);
			} else if(this.players[i].keys.Shotgun.isDown && !this.players[i].dead){
				this.players[i].weapon = 'shotgun';	
				this.players[i].loadTexture(this.players[i].sprites[2]);	
			}

			//Grab brain
			if(this.players[i].keys.GrabBrain.isDown){
				if(!this.players[i].grabBrainKeyJustPressed){
					this.players[i].holdingBrain = !this.players[i].holdingBrain;
					this.players[i].grabBrainKeyJustPressed = true;		
					if(this.players[i].holdingBrain){					
						this.grabBrain(this.players[i]);					
					} else {					
						this.releaseBrain(this.players[i]);
					}
				}	
			}

			if(this.players[i].keys.GrabBrain.isUp){
				this.players[i].grabBrainKeyJustPressed = false;			
			}
		}	
	},

	//Cheks if a player has other players nearby that he can resurrect. If so, allows resurrection
	checkIfDeadPlayerNearby(){
		for(var i = 0; i < this.players.length; i++){
			for(var j = 0; j < this.players.length; j++){
				if(!this.players[i].dead && i != j){
					if(Math.abs(Phaser.Point.distance(this.players[i].position, this.players[j].position)) < 30 && this.players[j].dead){
						this.players[i].resurrectText.setText("Press Resurrect Key");
						if(this.players[i].keys.Resurrect.isDown){	
							this.players[i].resurrecting = true;
							this.resurrectTimer.add(3500, this.resurrectPlayer, this, this.players[j],this.players[i]);	
							this.resurrectTimer.start();	
							this.players[i].resurrectText.setText(Math.floor(this.resurrectTimer.duration/1000) + 1);		
						} else {
							this.resurrectTimer.stop();
							this.players[i].resurrecting = false;
						}						
					} else {
						this.players[i].resurrectText.setText(" ");
					}
				}				
			}
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
			this.timeBetweenRounds = 25;
			this.zombiesPerRound += 5;
			this.restTimer.resume();
			this.actualRound++;
			
				this.dropTimer.resume();
			
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

		for(i = 0; i < this.players.length;i++){
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
			player.actualHp -= zombie.damage;
			this.healthBarPercent(player, player.actualHp / 30)
				if(player.actualHp <= 0){
					this.killPlayer(player);		
				}
			player.nextEnemyHitTimer.resume();
		}	
	},

	bulletZombieColision: function(shot,zombie){
		zombie.actualHp -= shot.damage;
		shot.kill();
		this.game.camera.shake(0.001, 100);
		this.particleBurst(zombie.position);

		var bloodSplash = this.game.add.sprite(zombie.position.x, zombie.position.y, 'bloodSplash');
		this.temporalSprites.add(bloodSplash);
		bloodSplash.anchor.setTo(0, 0.7);
		bloodSplash.rotation = this.game.physics.arcade.angleBetween(shot, zombie);	

		if(zombie.actualHp <= 0){
			zombie.kill();
			this.enemyCount--;

			var bloodPuddleSprite = this.game.rnd.integerInRange(0, this.bloodPuddleSprites.length);
			var bloodPuddle = this.game.add.sprite(zombie.position.x, zombie.position.y, this.bloodPuddleSprites[bloodPuddleSprite]);
			bloodPuddle.anchor.setTo(0.5);
			bloodPuddle.rotation = this.game.rnd.integerInRange(0, 360);
			this.temporalSprites.add(bloodPuddle);

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
		this.particleBurst(bullet.position);
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

	particleBurst(position){
		this.emitter.x = position.x;
		this.emitter.y = position.y;

		this.emitter.start(true, 1000, null, 5);
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
				player.shot[player.actualShot].position.x = x;
				player.shot[player.actualShot].position.y = y;
				player.shot[player.actualShot].rotation = this.game.physics.arcade.angleBetween(player, player.shot[player.actualShot]);	
				player.shot[player.actualShot].loadTexture('pistolBullet');
				player.shot[player.actualShot].reset(x, y);
			}else if(weapon.name == "ak"){
				var x, y;
				x = player.position.x + (50 * Math.cos(player.rotation));
				y = player.position.y + (50 * Math.sin(player.rotation));
				player.shot[player.actualShot].position.x = x;
				player.shot[player.actualShot].position.y = y;
				player.shot[player.actualShot].rotation = this.game.physics.arcade.angleBetween(player, player.shot[player.actualShot]) + Math.PI / 2;	
				player.shot[player.actualShot].loadTexture('akBullet');
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
				player.shot[i].position.x = x;
				player.shot[i].position.y = y;

				player.shot[i].rotation = this.game.physics.arcade.angleBetween(player, player.shot[i]);	
				player.shot[i].loadTexture('shotgunBullet');
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
				if (player.pistol.actualMagazine > 0 && player.reloading == false)
				{		
					this.fire(player.pistol, player);
					
				} else if(player.pistol.actualMagazine <= 0){ //Reloading
					player.reloading = true;
					player.reloadTimer.resume();
				}
				break;

			case "shotgun":
				if (player.shotgun.actualMagazine > 0 && player.reloading == false)
				{
					this.fireMultiple(player.shotgun, player);
					
				} else if(player.shotgun.actualMagazine <= 0 && player.akActualAmmo > 0){ //Reloading
					player.reloading = true;
					player.reloadTimer.resume();
				}
				break;

			case "ak":
				if (player.ak.actualMagazine > 0 && player.reloading == false)
				{
					this.fire(player.ak, player);
					
				} else if(player.ak.actualMagazine <=  0 && player.shotgunActualAmmo > 0){ //Reloading
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
			for(var i = 0; i < this.players.length; i++){
				if(Phaser.Point.distance(enemy.position, this.brain.position) < Phaser.Point.distance(enemy.position, this.players[i].position)){
					enemy.target = "brain";
				} else {	
					enemy.target = "player";									
				}
			}	
			
			//Checks if all players are dead		
			var allDead = true;	
			for(var i = 0; i < this.players.length; i++){
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
			for(var i = 0; i < this.players.length; i++){
				if(!this.players[i].dead){
					var distance = Phaser.Point.distance(enemy.position, this.players[i].position);	
					if(distance < minDistance){
						minDistance = distance;
					}
				}
			}

			for(var j = 0; j < this.players.length; j++){
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
		for(i = 0; i < this.maxDrops;i++){
			if(this.drops[i] != null){
				this.drops[i].kill();
			}
		}

		if(this.dropTime > 0){

			this.dropTime--;
			this.dropTimer.add(1000, this.createDrop, this);

		}else{
	
			for(i = 0; i < this.maxDrops;i++){
				var dropPos = this.getPositionFromCoord(this.getRandomTile());
				this.drops[i] = this.game.add.sprite(dropPos.x, dropPos.y, 'drop');
				this.drops[i].anchor.setTo(0.5);
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

	deleteDropText: function(player){
		player.dropCatchedTimer.pause();
		player.dropCatchedText.setText("");
		player.dropCatchedTimer.add(2000,this.deleteDropText,this,player);
	},
		//#endregion

	//#region [rgba(100, 100, 100, 0.1)] BRAIN METHODS
	//-----------------BRAIN METHODS-----------------
	grabBrain: function(player){
		if(Phaser.Point.distance(player, this.brain.position) < this.grabBrainDistance){
			player.speed = 100;			
			return;
		}		
		player.holdingBrain = false;
	},

	releaseBrain: function(player){		
		this.brain.position.x = player.position.x - 8;		
		this.brain.position.y = player.position.y - 8;		

		player.speed = player.originalSpeed;
		player.holdingBrain = false;
	},

	teleportBrain: function(){
		var pos = this.getPositionFromCoord(this.getRandomTile());
		this.brain.position = pos;
	},

	getRandomTile: function(){
		var row, column;
		row = this.game.rnd.integerInRange(0, this.levelDimensions.rows - 1);
		column = this.game.rnd.integerInRange(0, this.levelDimensions.columns - 1);

		while(this.gridIndices[column][row] != -1){
			row = this.game.rnd.integerInRange(0, this.levelDimensions.rows);
			column = this.game.rnd.integerInRange(0, this.levelDimensions.columns);
		}

		return {row: row, column: column};
	},
	//#endregion
	
	//#region [rgba(362, 100, 82, 0.1)] GAME OVER METHODS
	gameOver: function(){	
		/*this.game.camera.follow(this.brain, Phaser.Camera.FOLLOW_LOCKON, 0.05, 0.05);	
		this.camera.shake(0.02, 3000);		
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
		for(var i = 0; i < this.players.length; i++){
			if(!this.players[i].dead){
				gameOver = false;
			}
		}		

		if(gameOver) this.gameOver();
	},

	resurrectPlayer: function(playerDead,playerAlive){
		playerDead.dead = false;
		playerDead.body.enable = true;
		playerDead.actualHp = playerDead.hp / 4;
		if(playerDead == this.players[0]){
			playerDead.loadTexture('erwin');
		}else{
		playerDead.loadTexture('darwin');
			}
		this.healthBarPercent(playerDead, playerDead.actualHp / 30);

		playerAlive.resurrecting = false;

	},
	//#endregion	
}
