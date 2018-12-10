var Brainstein = Brainstein || {};
Brainstein.Game = function(){};

//PARA ORGANIZAR MEJOR EL CÓDIGO, ESTAMOS USANDO LA EXTENSIÓN COLORED REGIONS, QUE PONE COLORES A LAS REGIONES 
//PARA QUE SEAN MÁS DINSTINGUIBLES A SIMPLE VISTA.
//RECOMENDAMOS INSTALARLA PARA UNA MEJOR COMPRENSIÓN DEL CÓDIGO.

var dataTypes = {
	PLAYER: 0,
	ENEMY: 1,
	SHOT: 2,
	DROP: 3,
	BRAIN: 4,
	NEW_ENEMY: 5,
	RESURRECT: 6,
	ENTERINGMATCHMAKING: 7,
    CHECKOTHERPLAYERS: 8,
	CHANGELEVEL: 9,
	GAMEOVER: 10
}

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

		this.newEnemiesAvaible = false;
		this.targetPlayer = Brainstein.userID;
		this.creatingEnemies = false;
		
		this.framesWithoutPlayerInfo = 0;
		this.recievedPlayerInfoThisFrame = false;

		this.framesWithoutEnemiesInfo = 0;
		this.recievedEnemyInfoThisFrame = false;	
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
			
		var b = {
			dataType: dataTypes.BRAIN,

			posX : this.brain.position.x,
			posY : this.brain.position.y,
		};

		b = JSON.stringify(b);
		connection.send(b);

		this.grabBrainDistance = 60;		

		//-----------------PLAYER VARIABLES-----------------
		//Create player		
		this.player = this.createPlayer();		
		
		if(Brainstein.userID == 0){
			this.otherPlayer = this.createOtherPlayer(1);
		}else{
			this.otherPlayer = this.createOtherPlayer(0);
		}

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

		this.enemyBullets = this.game.add.group(); 
		this.enemyBullets.enableBody = true;
   		this.enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
		this.enemyBullets.createMultiple(50, 'bullet');
		this.enemyBullets.setAll('anchor.x', 0);
		this.enemyBullets.setAll('anchor.y', 0.5);
    	this.enemyBullets.setAll('checkWorldBounds', true);
		this.enemyBullets.setAll('outOfBoundsKill', true);

		this.enemyShots = [];
		this.actualEnemyShot = 0;
		////-----------------ENEMIES VARIABLES-----------------
		//Enemies
		this.enemies = [];
		this.serverEnemies = [];
		this.enemyCount = 0;	
		
		//-----------------ROUND LOOP VARIABLES-----------------
		this.timeBetweenRounds = 3; //Tiempo entre rondas(numero)
		
		this.restTimer = this.game.time.create(false); //Timer entre rondas(objeto timer)
		this.restTimer.add(1000, this.startRound, this);
		this.restTimer.start(); //EMPIEZA LA RONDA 1
		
		this.zombiesPerRound = 10;
		this.resting = true;
		this.actualRound = 0;		
		//-----------------ARROW VARIABLES-----------------
		this.arrow = this.game.add.sprite(this.game.width / 2, this.game.height / 2, "arrow");

		this.arrow.width = 150;
		this.arrow.height = 35;
		this.arrow.anchor.setTo(0, 0.5);
		this.arrow.position.x = this.player.position.x;
		this.arrow.position.y = this.player.position.y;
		//----------------DROPS-------------------
		this.dropTime = 2;
		this.maxDrops = 6;
		
		this.drops = [];
		for(i = 0; i < this.maxDrops;i++){
			this.drops[i] = this.game.add.sprite(-50,-50, 'drop');
			//this.drops[i].alpha = 0;
			this.game.physics.arcade.enable(this.drops[i]);
			this.drops[i].anchor.setTo(0.5);
			this.drops[i].width = 60;
			this.drops[i].height = 60;
		}
		this.lastDropKilled = -1;
		this.recievedDropThisFrame;

		this.dropTimer = this.game.time.create(false);
		this.dropTimer.add(1000,this.createDrop, this);
		this.dropTimer.start();
			//this.dropTimer.pause();	
		
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
		//-----------------SOUNDS-----------------
		this.backgroundMusic = this.game.add.audio('gameBackgroundMusic');
		this.backgroundMusic.loop = true;
		this.backgroundMusic.play();
		this.backgroundMusic.volume = 0.5;

        //Guns
        this.pistolshot = this.game.add.audio('pistolshot');
        this.muertezombie = this.game.add.audio('muertezombie');
		this.akshot = this.game.add.audio('akshot');
		this.sgunshot = this.game.add.audio('sgunshot');

		this.ouch = this.game.add.audio('ouch');
		//Others
		this.dropsound = this.game.add.audio('dropsound');
		this.resurrectharp = this.game.add.audio('resurrectharp');
		this.deathbell = this.game.add.audio('deathbell');

		//-----------------CAMERA VARIABLES-----------------		
		this.game.camera.target = null;
		this.game.time.desiredFps = 60;		

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

		this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_LOCKON, 0.2, 0.2);


	
	},	

	//Creates a level depending on the level specified in the LevelSelection state
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
		this.backgroundLayer2.renderSettings.enableScrollDelta = true;
		this.collisionLayer.renderSettings.enableScrollDelta = true;

		//Collision on blockedLayer
		this.map.setCollisionBetween(1, 5000, true, 'collisionLayer');

		//Resizes the game world to match the layer dimensions
		this.backgroundLayer.resizeWorld();		
		this.backgroundLayer2.resizeWorld();	

		this.camera.flash('#000000');

		this.game.physics.startSystem(Phaser.Physics.ARCADE);  	
	},

	//Creates the player moved by this client
	createPlayer: function(){
		//Sprite variables
		if(Brainstein.userID == 0){
			var player = this.game.add.sprite(150, 200, "erwin");
		} else	{
			var player = this.game.add.sprite(250, 300, "darwin");
		}

		player.playerID = Brainstein.userID;

		player.width = 64;
		player.height = 64;
		player.anchor.setTo(0.25, 0.5);
		player.rot = 0;
		

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
		if(Brainstein.userID == 0){
			player.sprites = ["erwin", "erwinAk", "erwinShotgun"];
		} else	{
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

		//Get player ID		

		//Posting the player in the server	
		return player;
	},

	//Creates the players recieved from the server
    createOtherPlayer(ID){		
		if(ID == 0){
			var otherPlayer = Brainstein.Game.game.add.sprite(0, 0, "erwin");
		}else{
			var otherPlayer = Brainstein.Game.game.add.sprite(0, 0, "darwin");
		}

		otherPlayer.anchor.setTo(0.25, 0.5);


		otherPlayer.playerID =ID;
		otherPlayer.posX = 0;
		otherPlayer.posY = 0;
		otherPlayer.hp = 30;
		otherPlayer.actualHp = otherPlayer.hp;

		otherPlayer.dead = false;
	
		otherPlayer.redHealthBar = Brainstein.Game.game.add.image(otherPlayer.x - 58, otherPlayer.y - 60, 'redHealthBar');
		otherPlayer.redHealthBar.width = 115;
		otherPlayer.redHealthBar.height = 10;
		otherPlayer.healthBar = Brainstein.Game.game.add.image(otherPlayer.x - 58, otherPlayer.y - 60, 'healthBar');					
		otherPlayer.healthBar.width = 115;
		otherPlayer.healthBar.height = 10;

		otherPlayer.velX = 0;
		otherPlayer.velY = 0;

		otherPlayer.previousPosX = 0;
		otherPlayer.previousPosY = 0;

		Brainstein.Game.game.physics.arcade.enable(otherPlayer);	
		otherPlayer.body.collideWorldBounds = true;

		/*if(otherPlayer.playerID == 1){
			otherPlayer.loadTexture("darwin");
		}*/

		if(otherPlayer.playerID == 0){
			otherPlayer.sprites = ["erwin", "erwinAk", "erwinShotgun"];
		} else	{
			otherPlayer.sprites = ["darwin", "darwinAk", "darwinShotgun"];
		}

		otherPlayer.deadSprite = "deadPlayer";

		return otherPlayer;
			
	},

	//Creates an enemy choosing a random coord according to a random spawnpoint
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
		zombie.enemyID = zombie.pos;

		zombie.velX = 0;
		zombie.velY = 0;
		
		this.enemies[this.enemyCount] = zombie;		
		this.enemyCount++;

		return zombie;
	},

	//Creates the enemies recieved from the sever
	createNewEnemies(enemy){
		var x = JSON.parse(enemy.posX);
		var y = JSON.parse(enemy.posY);

		this.createEnemyInPosition(x, y);
	},

	//Creates an enemy in a specified position
	createEnemyInPosition: function(x, y){
		var zombie;
		var tile = this.getCoordFromPosition({x, y});
		zombie = this.game.add.sprite(x, y, 'zombie'); 	
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

		zombie.velX = 0;
		zombie.velY = 0;

		this.enemyCount++;
		this.enemies[this.enemies.length] = zombie;

		return zombie;
	},

	//Returns an array with all the hotkeys
	createKeys: function(){		
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
		
		
		return keys;
					
	},	

	//Creates a weapon assigned to a player
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

	//Creates a spawnpoint at a given position
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

		if(this.newEnemiesAvaible){
			this.createNewEnemies();
		}

		//If there are other players, check if they are dead and nearby
	
		this.checkIfDeadPlayerNearby();			

		this.updatePlayer(this.player);
		this.handleKeyboardInput();	
		this.updateText();	
		this.updateTemporalSprites();	
		this.handleRound();				
		this.collisionsAndOverlaps();
		//this.updateCamera();
		this.updateArrow();	
		this.checkifGameOver();

		if(Brainstein.userID == 0){
			//Finds a path from enemy to player and updates its position			
			for(var i = 0; i < this.enemies.length; i++){
				this.moveEnemy(this.enemies[i]);			
			}	

			this.sendEnemiesInfo();	
		}	
		
		/*if(this.player.dead){
			this.checkIfResurrected();
		}*/

		if(!this.recievedEnemyInfoThisFrame && Brainstein.userID != 0){
			this.updateOtherEnemiesWithCurrentInfo();
		}

	
		this.framesWithoutPlayerInfo += 1;
		this.framesWithoutEnemiesInfo += 1;
		this.recievedPlayerInfoThisFrame = false;
		this.recievedEnemyInfoThisFrame = false;		

		this.sendPlayerInfo();	
		connection.onmessage = function(data){
			Brainstein.Game.handleDataRecieved(data);
		}
	},

	//Updates the main player
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

				var b = {
					dataType: dataTypes.BRAIN,

					posX : this.brain.position.x,
					posY : this.brain.position.y,
				};
		
				b = JSON.stringify(b);
				connection.send(b);
			
		}

		//Player movement
		if(!player.dead){
			player.rotation = this.game.physics.arcade.angleToPointer(player);	
			player.rot = player.rotation;
		}			
	},	

	updateOtherPlayers(player){
		//Position & Rotation
		this.otherPlayer.position.x = JSON.parse(player.posX);
		this.otherPlayer.position.y = JSON.parse(player.posY);
		this.otherPlayer.rotation = JSON.parse(player.rotation);
		

		//HP
		this.otherPlayer.actualHp = JSON.parse(player.hp);
		this.healthBarPercent(this.otherPlayer, this.otherPlayer.actualHp);

		this.otherPlayer.dead = JSON.parse(player.dead);		
		if(this.otherPlayer.dead){
			this.otherPlayer.loadTexture(this.otherPlayer.deadSprite); 
		} 

		//Shooting
		this.otherPlayer.weapon = player.weapon;
		if(!this.otherPlayer.dead){
			switch(this.otherPlayer.weapon){
				case ("pistol"):
					this.otherPlayer.loadTexture(this.otherPlayer.sprites[0]);
					break;
				case ("ak"):
					this.otherPlayer.loadTexture(this.otherPlayer.sprites[1]);
					break;
				case ("shotgun"):
					this.otherPlayer.loadTexture(this.otherPlayer.sprites[2]);
					break;
			}
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
	
	//Updates the enemies with the info received from the server
	updateServerEnemies(enemy){	
		for(var i = 0; i < this.enemies.length; i++){
			var ID = JSON.parse(enemy.enemyID);
			if(ID == this.enemies[i].pos){
				this.enemies[i].position.x = JSON.parse(enemy.posX);
				this.enemies[i].position.y = JSON.parse(enemy.posY);
				this.enemies[i].rotation = JSON.parse(enemy.rotation);				
			}
		
		}
		
	},

	//Updates the enemies the frames we haven't received any info from the server.
	//Updates the enemiess position with the velocity being calculated with the previous position of the enemies
	updateOtherEnemiesWithCurrentInfo(){
		for(var i = 0; i < this.enemies.length; i++){	
			this.enemies[i].position.x += this.enemies[i].velX;
			this.enemies[i].position.y += this.enemies[i].velY;
		}
	},
	
	//Updates all the texts
	updateText: function(){
		//JUGADOR LOCAL
		//Texto ronda actual
		this.actualRoundNumberText.setText(this.actualRound+1);		
	
		//Textos de los drops
		this.player.dropCatchedText.x = this.player.x;
		this.player.dropCatchedText.y = this.player.y - 100;			

		//Health Bars
		this.player.healthBar.x = this.player.x - 58;
		this.player.healthBar.y = this.player.y - 60;		

		this.player.redHealthBar.x = this.player.x - 58;
		this.player.redHealthBar.y = this.player.y - 60;
		
		//Resurrect Text
		if(!this.player.resurrecting){
			this.player.resurrectText.position.x = this.player.position.x;
			this.player.resurrectText.position.y = this.player.position.y + 50;	
		} else {
			this.player.resurrectText.position.x = this.player.position.x;
			this.player.resurrectText.position.y = this.player.position.y + 50;	
		}	

		//Weapon & Ammo Text
		if(!this.player.dead){
			switch(this.player.weapon){
				case "pistol":
					this.player.reloadTextPlayer.setText("Pistola:" + this.player.pistol.actualMagazine + "/Inf");
					this.player.reloadTextPlayer.position.x = this.player.position.x;
					this.player.reloadTextPlayer.position.y = this.player.position.y - 70;
					break;

				case "shotgun":
					this.player.reloadTextPlayer.setText("Escopeta:" + this.player.shotgun.actualMagazine + "/" + this.player.shotgunActualAmmo);
					this.player.reloadTextPlayer.position.x = this.player.position.x;
					this.player.reloadTextPlayer.position.y = this.player.position.y - 70;
					break;

				case "ak":
					this.player.reloadTextPlayer.setText("AK:" + this.player.ak.actualMagazine + "/" + this.player.akActualAmmo);
					this.player.reloadTextPlayer.position.x = this.player.position.x;
					this.player.reloadTextPlayer.position.y = this.player.position.y - 70;
					break;			
			}	

			if(this.player.reloading == true){
				this.player.reloadTextPlayer.setText("RECARGANDO");				
			} 	
		}else{
			this.player.reloadTextPlayer.setText("");			
		}	
		
		//Grab Brain Text
		if(Phaser.Point.distance(this.player, this.brain.position) < this.grabBrainDistance && !this.player.holdingBrain){
			this.player.grabBrainText.position.x = this.player.position.x;
			this.player.grabBrainText.position.y = this.player.position.y + 50;
			this.player.grabBrainText.setText("Press space to grab");			
		} else {
			this.player.grabBrainText.setText(" ");			
		}
				

		if(this.resting == true){
			this.restTimerText.setText(this.timeBetweenRounds);
		} else {
			this.restTimerText.setText("");
		}

		//OTROS JUGADORES		
		//Health Bars
		this.otherPlayer.healthBar.x = this.otherPlayer.x - 58;
		this.otherPlayer.healthBar.y = this.otherPlayer.y - 60;		
		
		this.otherPlayer.redHealthBar.x = this.otherPlayer.x - 58;
		this.otherPlayer.redHealthBar.y = this.otherPlayer.y - 60;
		

	},

	//Checks if the camera position should change according to the screen bounds
	updateCamera(){
		//Camera goes right
		if(this.currentCameraPosition + 1 < this.cameraPositions.length){
			if(this.cameraPositions[this.currentCameraPosition + 1].x != 0){ 		
				if(this.player.position.x >= this.camera.position.x + this.game.width){					
					this.currentCameraPosition++;
					this.game.camera.position = this.cameraPositions[this.currentCameraPosition];
				}
			} 
		}

		//Camera goes left
		if(this.currentCameraPosition > 0){		
			if(this.player.position.x < this.camera.position.x){		
				this.currentCameraPosition--;
				this.game.camera.position = this.cameraPositions[this.currentCameraPosition];
			}
		}

		//Camera goes up
		if(this.currentCameraPosition >= this.cameraXPositionsCount){						
			if(this.player.position.y < this.camera.position.y){		
				this.currentCameraPosition -= this.cameraXPositionsCount;	
				this.game.camera.position = this.cameraPositions[this.currentCameraPosition];		
	
			}
		}

		//Camera goes down
		if(this.currentCameraPosition + this.cameraXPositionsCount < this.cameraPositions.length){			
			if(this.player.position.y >= this.camera.position.y + this.game.height){				
				this.currentCameraPosition += this.cameraXPositionsCount;	
				this.game.camera.position = this.cameraPositions[this.currentCameraPosition];
			}
		}

	},

	//Updates arrow rotation & alpha
	updateArrow(){
		if(Phaser.Point.distance(this.player.position, this.brain.position) < 500){		   
			this.arrow.alpha = 0;			
		} else {
			this.arrow.alpha = 0.6;
			this.arrow.position = this.player.position;
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

	//takes care of all the input from the keyboard
	handleKeyboardInput: function(){	
		//Movement
		if(this.player.keys.Left.isDown){	
			this.player.body.velocity.x -= this.player.speed;
		}
		else if(this.player.keys.Right.isDown){	
			this.player.body.velocity.x += this.player.speed;
		}
		if(this.player.keys.Up.isDown){	
			this.player.body.velocity.y -= this.player.speed;
		}		
		else if(this.player.keys.Down.isDown){
			this.player.body.velocity.y += this.player.speed;
		}			


		//Reload
		if(this.player.keys.Reload.isDown){
			this.player.reloading = true;
			this.player.reloadTimer.resume();
		}

		//Weapons inventory
		if(this.player.keys.Pistol.isDown && !this.player.dead){
			this.player.weapon = 'pistol';
			this.player.loadTexture(this.player.sprites[0]);
		} else if(this.player.keys.AK.isDown && !this.player.dead){
			this.player.weapon = 'ak';
			this.player.loadTexture(this.player.sprites[1]);
		} else if(this.player.keys.Shotgun.isDown && !this.player.dead){
			this.player.weapon = 'shotgun';	
			this.player.loadTexture(this.player.sprites[2]);	
		}

		//Grab brain
		if(this.player.keys.GrabBrain.isDown){
			if(!this.player.grabBrainKeyJustPressed){
				this.player.holdingBrain = !this.player.holdingBrain;
				this.player.grabBrainKeyJustPressed = true;		
				if(this.player.holdingBrain){					
					this.grabBrain(this.player);					
				} else {					
					this.releaseBrain(this.player);
				}
			}	
		}

		if(this.player.keys.GrabBrain.isUp){
			this.player.grabBrainKeyJustPressed = false;			
		}
		
	},

	//Cheks if a player has other players nearby that he can resurrect. If so, allows resurrection
	checkIfDeadPlayerNearby(){
		if(!this.player.dead){					
			if(Math.abs(Phaser.Point.distance(this.player.position, this.otherPlayer.position)) < 64 && this.otherPlayer.dead){
				this.player.resurrectText.setText("Press Resurrect Key");
				if(this.player.keys.Resurrect.isDown){	
					this.player.resurrecting = true;
					this.resurrectTimer.add(3500, this.resurrectPlayer, this, this.otherPlayer, this.player);	
					this.resurrectTimer.start();	
					this.player.resurrectText.setText(Math.floor(this.resurrectTimer.duration/1000) + 1);		
				} else {
					this.resurrectTimer.stop();
					this.player.resurrecting = false;
				}						
			} else {
				this.player.resurrectText.setText(" ");
			}		
		}
	},
	

	//#endregion

	//#region [rgba (155, 0, 255, 0.1)] SERVER METHODS
	handleDataRecieved(data){
		var parsedData = JSON.parse(data.data);

		switch(parsedData.dataType){
			case "0"://parsedData.dataType.PLAYER"":
				this.updateOtherPlayers(parsedData);
				break;
			case "1":
				this.updateServerEnemies(parsedData);
				break;
			case "2":
				this.updateOtherPlayerShots(parsedData);
				break;
			case "3":
				this.updateDropsInfo(parsedData);
				break;
			case "4":
				this.updateBrainInfo(parsedData);
				break;
			case "5":
				this.createNewEnemies(parsedData);
				break;
			case "6":
				this.checkIfResurrected(parsedData);
			break;

		}

	},

	//Sends the client's player info to the server
	sendPlayerInfo(){
		var player = {
			dataType: dataTypes.PLAYER,

			playerID: this.player.playerID,
			
			posX: this.player.position.x,
			posY: this.player.position.y,
			rotation: this.player.rot,

			hp: this.player.actualHp,

			weapon: this.player.weapon,

			dead: this.player.dead,
		};


		player = JSON.stringify(player);

		connection.send(player);
	},		

	//Sends the enemies info to the server
	sendEnemiesInfo(){		
		for(var i = 0; i < this.enemies.length; i++){
			var enemy = {
				dataType: dataTypes.ENEMY,

				enemyID: this.enemies[i].pos,

				posX: this.enemies[i].position.x,
				posY: this.enemies[i].position.y,
				rotation: this.enemies[i].rotation,				
			}

			enemy = JSON.stringify(enemy);

			connection.send(enemy);
		}
	}, 

	//Updates the shots from the other clients, applying them physics
	updateOtherPlayerShots(otherPlayerShots){		
		if(otherPlayerShots.weaponName != "shotgun"){
			var s = this.enemyBullets.getFirstDead();
			s.x = JSON.parse(otherPlayerShots.posX);
			s.y = JSON.parse(otherPlayerShots.posY);
			s.rotation = JSON.parse(otherPlayerShots.rotation);
			s.speed = JSON.parse(otherPlayerShots.speed);
			s.weaponName = otherPlayerShots.weaponName;
			s.lookAt = JSON.parse(otherPlayerShots.rotation);

			if(s.weaponName == "pistol"){
				s.loadTexture('pistolBullet');
				s.damage = this.player.pistol.damage;
				this.pistolshot.play();
			}else{
				s.lookAt -= Math.PI/2;
				s.loadTexture('akBullet');
				//s.rotation -= Math.PI / 2;
				s.damage = this.player.ak.damage;
				this.akshot.play();
				//s.rotation -= Math.PI / 2;
				s.damage = this.player.ak.damage;
			}
			s.reset(s.x, s.y);
			s.body.velocity.setToPolar(s.lookAt,s.speed);
			
			this.enemyShots[this.actualEnemyShot] = s;
			this.actualEnemyShot++;
		}else{
			var j = -1;
			
			for(i = 0;i < this.player.shotgun.numberOfBullets;i++){
			
				var s = this.enemyBullets.getFirstDead();

				s.x = JSON.parse(otherPlayerShots.posX);
				s.y = JSON.parse(otherPlayerShots.posY);
				s.rotation = JSON.parse(otherPlayerShots.rotation);
				s.speed = JSON.parse(otherPlayerShots.speed);
				s.weaponName = otherPlayerShots.weaponName;
				s.damage = this.player.shotgun.damage;
				s.loadTexture('shotgunBullet');
				s.reset(s.x, s.y);
				
				this.sgunshot.play();

				if(i == 0){
					var angle = s.rotation;
				}else{
					var angle = s.rotation + (j * this.player.shotgun.angle);
				}				
				s.body.velocity.setToPolar(angle,s.speed);
				
				j = j*-1;

				this.enemyShots[this.actualEnemyShot] = s;
				this.actualEnemyShot++;
			}
		}

		if(this.actualEnemyShot > this.player.ak.maxAmmo){
			this.actualEnemyShot = 0;
		}
	

	},
	
	//Updates the brain's info in the server
	updateBrainInfo(brainInfo){
		this.brain.position.x = JSON.parse(brainInfo.posX);
		this.brain.position.y = JSON.parse(brainInfo.posY);
	},

	//Updates the position of the drops
	updateDropsInfo(drop){
		i = drop.dropID;

		this.drops[i].revive();
		this.drops[i].position.x = JSON.parse(drop.posX);
		this.drops[i].position.y = JSON.parse(drop.posY);
		//this.drops[i] = this.game.add.sprite(this.drops[i].posX, this.drops[i].posY, 'drop');
		this.drops[i].shotgunAmmo = JSON.parse(drop.shotgunAmmo);
		this.drops[i].akAmmo = JSON.parse(drop.akAmmo);
		this.drops[i].health = JSON.parse(drop.health);

		this.drops[i].dropID = JSON.parse(drop.dropID);

		this.drops[i].alpha = 1;

		this.game.physics.arcade.enable(this.drops[i]);
			
	},	

	killDrop(id){
		if(id != -1){
			for(i = 0; i < this.maxDrops;i++){
				var temp = this.drops[i].dropID;
				if(temp == id){
					this.drops[i].kill();
				}
			}
		}
	},

	//Checks if this client's player has been resurrected
	checkIfResurrected(parsedData){		
		if(parsedData.text = "resucitado"){
			
			Brainstein.Game.player.dead = false;
			Brainstein.Game.player.body.enable = true;
			Brainstein.Game.player.actualHp = Brainstein.Game.player.hp / 4;
			Brainstein.Game.healthBarPercent(Brainstein.Game.player, Brainstein.Game.player.actualHp);

			Brainstein.Game.resurrectharp.play();

			switch(Brainstein.Game.player.weapon){
				case ("pistol"):
					Brainstein.Game.player.loadTexture(Brainstein.Game.player.sprites[0]);
					break;
				case ("ak"):
					Brainstein.Game.player.loadTexture(Brainstein.Game.player.sprites[1]);
					break;
				case ("shotgun"):
					Brainstein.Game.player.loadTexture(Brainstein.Game.player.sprites[2]);
					break;
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
	
			if(Brainstein.userID == 0){					
				this.createHorde();
				if(this.enemies.length < this.zombiesPerRound){
					this.game.time.events.repeat(Phaser.Timer.SECOND * 0.50, Math.ceil(this.zombiesPerRound / this.enemyHordeLenght)-1 , this.createHorde, this);			
				}
			} 
		}
	},

	handleRound: function(){
		if(this.enemyCount == 0 && this.resting == false && !this.creatingEnemies){ //Si no quedan enemigos -> Empieza el tiempo de descanso
			this.resting = true; 
			this.timeBetweenRounds = 25;
			this.zombiesPerRound += 5;
			this.restTimer.resume();
			this.actualRound++;
			
			this.dropTimer.resume();
			
			if(Brainstein.userID == 0){
				this.teleportBrain();
			}	
		}

	},

	createHorde: function(){
		var newHorde = [];
		for(var j = 0; j < this.enemyHordeLenght ; j++){
				var zombie = this.createEnemy('zombie');

				var zombieJSON = {
					dataType: dataTypes.NEW_ENEMY,

					enemyID: this.enemies.length - 1,

					posX: zombie.position.x,
					posY:zombie.position.y,
					rotation: zombie.rotation
				}

				zombieJSON = JSON.stringify(zombieJSON);
				connection.send(zombieJSON);	

		}	
		
		
	
	},
	//#endregion
	
	//#region [rgba (0, 200, 200, 0.1)] PHYSICS METHODS
	//Recognize a collision between sprites
	collisionsAndOverlaps: function(){
		this.game.physics.arcade.overlap(this.enemies, this.brain, this.gameOver, null, this);
		this.game.physics.arcade.collide(this.player, this.enemies, this.playerZombieColision,null,this);
		this.game.physics.arcade.overlap(this.player,this.drops,this.playerDropColision,null,this);	
		this.game.physics.arcade.overlap(this.otherPlayer,this.drops,this.playerDropColision,null,this);	
		this.game.physics.arcade.collide(this.player, this.collisionLayer);				
		this.game.physics.arcade.overlap(this.player.shot, this.enemies, this.bulletZombieColision,null,this);
		this.game.physics.arcade.collide(this.player.shot, this.collisionLayer, this.bulletCollsionLayerCollision,null,this);

		this.game.physics.arcade.overlap(this.enemyShots, this.enemies, this.bulletZombieColision,null,this);	
		this.game.physics.arcade.collide(this.enemyShots, this.collisionLayer, this.bulletCollsionLayerCollision,null,this);
	},

	temporalColision(){
		console.log('te chocaste');
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
			
			this.ouch.play();

			this.healthBarPercent(player, player.actualHp)
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

			this.muertezombie.play();

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
		
		var dropID = drop.dropID;
		dropID = JSON.stringify(dropID);		
		drop.kill();

		this.dropsound.play();
		if(Brainstein.userID == player.playerID){
			player.shotgunActualAmmo += drop.shotgunAmmo;
			player.akActualAmmo += drop.akAmmo;
			player.resources += drop.resources;
			player.actualHp += drop.health;
			if(player.actualHp > 30) player.actualHp = 30;
			this.healthBarPercent(player, player.actualHp);
			player.dropCatchedTimer.resume();
			player.dropCatchedText.setText(drop.shotgunAmmo + " Balas escopeta\n" + drop.akAmmo + " Balas AK");
		}
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

	//Changes the healthbar according to the player's hp
	healthBarPercent: function(player, hp){
		player.healthBar.width = 115 * (hp / 30);
	},

	particleBurst(position){
		this.emitter.x = position.x;
		this.emitter.y = position.y;

		this.emitter.start(true, 1000, null, 5);
	},
	//#endregion		
	
	//#region [rgba(200, 200, 0, 0.1)] SHOOTING METHODS
	//Pistol and Ak fire
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

				this.pistolshot.play();
			}else if(weapon.name == "ak"){
				var x, y;
				x = player.position.x + (50 * Math.cos(player.rotation));
				y = player.position.y + (50 * Math.sin(player.rotation));
				player.shot[player.actualShot].position.x = x;
				player.shot[player.actualShot].position.y = y;
				player.shot[player.actualShot].rotation = this.game.physics.arcade.angleBetween(player, player.shot[player.actualShot]) + Math.PI / 2;	
				player.shot[player.actualShot].loadTexture('akBullet');
				player.shot[player.actualShot].reset(x, y);

				this.akshot.play();
			}
			   this.game.physics.arcade.moveToPointer(player.shot[player.actualShot], weapon.speed);
			   
			//Subir el disparo al servidor
			var shotInfo = {
				dataType: dataTypes.SHOT,

				posX: player.shot[player.actualShot].position.x,
				posY: player.shot[player.actualShot].position.y,
				rotation: player.shot[player.actualShot].rotation,

				//lookAt : player.shot[player.actualShot].rotation,

				weaponName : weapon.name,
				playerShotingID : player.playerID,
				speed: weapon.speed
			};
			shotInfo = JSON.stringify(shotInfo);

			connection.send(shotInfo);

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

	//Shotgun fire
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

			var shotInfo = {
				dataType: dataTypes.SHOT,

				posX: player.shot[0].position.x,
				posY: player.shot[0].position.y,
				rotation: player.shot[0].rotation,

				weaponName : weapon.name,
				playerShotingID : player.playerID,
				speed: weapon.speed
			}

			shotInfo = JSON.stringify(shotInfo);

			connection.send(shotInfo);

			weapon.fireRate = 600;
			
			this.sgunshot.play();

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

	//Takes care of the "OnClick" event
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
			var minDistance = Number.POSITIVE_INFINITY;	
		
			//Checks what is closer, the brain or the main player
			if(Phaser.Point.distance(enemy.position, this.brain.position) < Phaser.Point.distance(enemy.position, this.player.position)){
				//Checks what is closer, the brain or any other player				
				if(Phaser.Point.distance(enemy.position, this.brain.position) < Phaser.Point.distance(enemy.position, this.otherPlayer.position)){
					enemy.target = "brain";
				} else {
					enemy.target = "player";		
				}						
			} else {	
				enemy.target = "player";												
			}
			
			
			
			//Checks if all players are dead		
			var allDead = true;		
			if(!this.player.dead || !this.otherPlayer.dead){
				allDead = false;
			}				
			

			if(allDead)	enemy.target = "brain";
			
		}		

		var targetPosition, targetPlayer = -1;	
		if(enemy.target == "player"){				
			//Checks which player is closer
			minDistance = Number.POSITIVE_INFINITY;	
			//First, all of the other players			
			if(!this.otherPlayer.dead){
				var distance = Phaser.Point.distance(enemy.position, this.otherPlayer.position);	
				if(distance < minDistance){
					minDistance = distance;
				}
			}
			
			//Then, the main player
			var distance = Phaser.Point.distance(enemy.position, this.player.position);	
			if(distance < minDistance){
				minDistance = distance;
			}

			//Checks which player is at that distance			
			if(!this.otherPlayer.dead){
				var distance = Phaser.Point.distance(enemy.position, this.otherPlayer.position);	
				if(distance == minDistance){
					targetPlayer = this.otherPlayer;
				}
			}
		

			distance = Phaser.Point.distance(enemy.position, this.player.position);	
			if(distance == minDistance){
				targetPlayer = this.player;
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
		 //Para que no peten los drops porq se crean desde el principio, luego solo se les actualiza la posicion
			for(i = 0; i < this.maxDrops;i++){
				if(this.drops[i] != null){
					this.drops[i].kill();
				}
			}

		if(this.dropTime > 0){
			this.dropTime--;
			this.dropTimer.add(1000, this.createDrop, this);
		}else{
			if(Brainstein.userID == 0){
				for(i = 0; i < this.maxDrops;i++){
					var dropPos = this.getPositionFromCoord(this.getRandomTile());
					/*{	x: this.game.rnd.integerInRange(50,200),
						y: this.game.rnd.integerInRange(50,200)
					};*/

					this.drops[i].revive();
					this.drops[i].position.x = dropPos.x;
					this.drops[i].position.y = dropPos.y;
					//this.drops[i].alpha = 1;

					this.drops[i].dropID = i; //Posicion del drop en el array de drops

					this.drops[i].shotgunAmmo = this.game.rnd.integerInRange(0,this.player.shotgun.magazineCapacity * 2);
						while(this.drops[i].shotgunAmmo % 3 != 0){ //A la escopeta siempre le damos balas multiplos de 3
							this.drops[i].shotgunAmmo = this.game.rnd.integerInRange(0,this.player.shotgun.magazineCapacity * 2);
						}
					this.drops[i].akAmmo = this.game.rnd.integerInRange(0,this.player.ak.magazineCapacity * 2);
					this.drops[i].health = this.game.rnd.integerInRange(5, 15);
				
					var d = {
						dataType: dataTypes.DROP,

						posX: this.drops[i].position.x,
						posY: this.drops[i].position.y,
						shotgunAmmo: this.drops[i].shotgunAmmo,
						akAmmo:	this.drops[i].akAmmo,
						health:	this.drops[i].health,
						dropID: this.drops[i].dropID
					};
			
					d = JSON.stringify(d);
					connection.send(d);

			}	
			//this.dropTimer.pause();
			this.dropTimer.add(5000, this.createDrop, this);
		}
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
		
			var b = {
				dataType : dataTypes.BRAIN,
				posX : this.brain.position.x,
				posY : this.brain.position.y,
			};
	
			b = JSON.stringify(b);
			connection.send(b);
	
	
	},

	//Gets a random tile with no collision
	getRandomTile: function(){
		var row, column;
		row = this.game.rnd.integerInRange(0, this.levelDimensions.rows - 1);
		column = this.game.rnd.integerInRange(0, this.levelDimensions.columns - 1);

		while(column >= this.levelDimensions.columns){
			column = this.game.rnd.integerInRange(0, this.levelDimensions.columns - 1);
		}

		while(row >= this.levelDimensions.rows){
			row = this.game.rnd.integerInRange(0, this.levelDimensions.rows - 1);
		}

		while(column >= this.levelDimensions.columns || row >= this.levelDimensions.rows || this.gridIndices[column][row] != -1){
			row = this.game.rnd.integerInRange(0, this.levelDimensions.rows - 1);
			column = this.game.rnd.integerInRange(0, this.levelDimensions.columns - 1);
		}

		return {row: row, column: column};
	},
	//#endregion
	
	//#region [rgba(362, 100, 82, 0.1)] GAME OVER METHODS
	checkifGameOver(){
		//Checks if all players are dead
		var gameOver = false;		
		if(this.player.dead && this.otherPlayer.dead){
			gameOver = true;
		}

	
		if(gameOver) this.gameOver();
	},

	gameOver: function(){	
		/*this.game.camera.follow(this.brain, Phaser.Camera.FOLLOW_LOCKON, 0.05, 0.05);	
		this.camera.shake(0.02, 3000);		
		this.camera.fade('#ff0000', 3000);
		this.camera.onFadeComplete.add(this.fadeComplete, this);*/
	},

	fadeComplete: function(){
		this.backgroundMusic.stop();
		this.state.start('GameOver');

	},
	//#endregion

	//#region [rgba(90, 0, 90, 0.1)] DEATH & RESURRECTION METHODS
	killPlayer: function(player){
		player.dead = true;
		player.body.enable = false;
		player.loadTexture('deadPlayer');	
		player.holdingBrain = false;

		this.deathbell.play();

		var player = {
			playerID: player.playerID
		}

		player = JSON.stringify(player);
	},

	resurrectPlayer: function(playerDead,playerAlive){
		playerDead.dead = false;
		playerDead.body.enable = true;
		playerDead.actualHp = playerDead.hp / 4;

		if(playerDead.playerID == 0){
			playerDead.loadTexture('erwin');
		}else{
			playerDead.loadTexture('darwin');
		}	

		this.healthBarPercent(playerDead, playerDead.actualHp);

		playerAlive.resurrecting = false;

		var r = {
			dataType: dataTypes.RESURRECT,

			text: "resucitado"
		};

		r = JSON.stringify(r);
		connection.send(r);
		
		this.resurrectharp.play();

	},
	//#endregion	
}
