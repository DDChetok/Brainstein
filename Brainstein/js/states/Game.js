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
		//Pistol
		//this.pistol = this.game.add.sprite(this.game.world.centerX - 180, this.game.world.centerY, 'pistol');
		//this.pistol.scale.setTo(0.1);
		this.pistol = {			
			nextFire: 0,
			fireRate: 100,
			magazine: 12,
			power: 1,
			damage: 5,
			name: "pistol"
		};

		//Shotgun
		//this.shotgun = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY + 120, 'shotgun');
		//this.shotgun.scale.setTo(0.2);
		this.shotgun = {
			nextFire: 0,
			fireRate: 120,
			magazine: 12,
			power: 3,
			damage: 8,
			name: "shotgun",
			speed: 300,
			angle: 0.25
		};

		//AK
		//this.ak = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY - 120, 'ak');
		//this.ak.scale.setTo(0.2);
		this.ak = {
			nextFire: 0,
			fireRate: 50,
			magazine: 30,
			power: 1,
			damage: 8,
			name: "ak"
		};

		//Bullets and reload
		this.reloadTimer = this.game.time.create(false);
		this.reloadTimer.add(2000, this.reloadMethod, this);
		this.reloadTimer.start();
		this.reloadTimer.pause();

		this.bullets = this.game.add.group(); 
		this.bullets.enableBody = true;
   		this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
		this.bullets.createMultiple(50, 'bullet');
		this.bullets.setAll('anchor.x', 0.5);
		this.bullets.setAll('anchor.y', 0.5);
    	this.bullets.setAll('checkWorldBounds', true);
		this.bullets.setAll('outOfBoundsKill', true);
		//Reload text
		this.game.physics.arcade.enable(this.shotgun);
		this.game.physics.arcade.enable(this.ak);	
		this.game.physics.arcade.enable(this.pistol);

		this.shot = [];

		//-----------------PLAYER VARIABLES-----------------
		//Create player
		this.player = this.game.add.sprite(20, 150, 'erwin');		
		//this.player.scale.setTo(0.05);
		this.player.anchor.setTo(0.5, 0.5);			
		this.player.anchor.setTo(0.5, 0.5);	
		
		this.player.hp = 30;
		this.player.actualHp = this.player.hp;
		this.player.weapon = "pistol";
		this.player.building = false;
		this.player.actualAmmo = 12;	
		this.player.reloading = false;
		this.player.holdingBrain = false;

		//Modify body properties
		this.player.collideWorldBounds = true;		
		this.player.speed = 200;

		this.player.beingPushed = false;
		this.player.vectorPush;
		this.player.zombiePushing;

		//Create text	
		this.hpText = this.game.add.text(0, 500, "HP:" + this.player.actualHp + "/" + this.player.hp, { font: "65px Arial", fill: "#faaa00", align: "center" });
		this.hpText.fixedToCamera = true;
		
		//All animation here	

		//Enable player physics
		this.game.physics.startSystem(Phaser.Physics.ARCADE);		
		this.game.physics.arcade.enable(this.player);	
		this.player.body.collideWorldBounds = true;
		//this.game.physics.arcade.enable(this.enemies);	
	

		////-----------------ENEMIES VARIABLES-----------------
		//Enemies
		this.enemies = [];
		this.enemyCount = 0;
		this.createEnemy(152, 32, 'zombie');			
		//this.createEnemy(352, 150, 'zombie');	
		//this.createEnemy(152, 32, 'zombie');		

		//-----------------PATHFINDING VARIABLES-----------------
		this.easyStar = new EasyStar.js();
		this.initPathfinding();		

		this.game.time.events.repeat(Phaser.Timer.SECOND * 1.5, 9223372036854775807, this.allowPathfinding, this);
		//this.game.time.events.repeat(Phaser.Timer.SECOND * 0.1, 9223372036854775807, this.allowEnemyAttack, this);

		//-----------------ADITIONAL VARIABLES-----------------
		//Create action keys
		this.actionKeys = this.createKeys();
		
		//FPS
		this.game.time.desiredFps = 60;

		//The camera will follow the player			
		this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_LOCKON, 0.05, 0.05);	

		//Text
		this.reloadText = this.game.add.text(0, 0, "Balas:" + this.player.actualAmmo + "/" + this.pistol.magazine, { font: "20px Arial", fill: "#ffff00", align: "center" });
		this.reloadText.fixedToCamera = true;
		this.playerPositionText = this.game.add.text(0, 570, "Player position -> x:" + this.player.position.x + "| y: " + this.player.position.y, { font: "20px Arial", fill: "#ffff00", align: "center" });
		this.playerPositionText.fixedToCamera = true;
		this.targetPositionText = this.game.add.text(300, 570, " ", { font: "20px Arial", fill: "#ffff00", align: "center" });
		this.targetPositionText.fixedToCamera = true;
		this.targetText = this.game.add.text(500, 570, " ", { font: "20px Arial", fill: "#ffff00", align: "center" });
		this.targetText.fixedToCamera = true;


		//Keyboard
		this.buildKeyJustPressed = false;
		this.grabBrainKeyJustPressed = false;

		//-----------------BUILDING VARIABLES-----------------		
		this.destructableBuildings = [];
		this.destructableBuildingsCount = 0;		
		//-----------------ROUND LOOP VARIABLES-----------------
		this.timeBetweenRounds = 2; //Tiempo entre rondas(numero)
		
		this.restTimer = this.game.time.create(false); //Timer entre rondas(objeto timer)
		this.restTimer.add(1000, this.startRound, this);
		this.restTimer.start();

		this.restTimerText = this.game.add.text(500, 500, this.timeBetweenRounds, { font: "20px Arial", fill: "#faaa00", align: "center" });
		this.restTimerText.fixedToCamera = true;
		
		this.zombiesPerRound = 1;

		this.resting = true;

		this.actualRound = 0;
		this.actualRoundText = this.game.add.text(300, 0, "Ronda actual:" + this.actualRound, { font: "20px Arial", fill: "#40FF00", align: "center" });
		this.actualRoundText.fixedToCamera = true;

			//-----------------BRAIN VARIABLES-----------------
		this.brain = this.game.add.sprite(180, 180, "brain");
	},

	update: function(){
		this.allowEnemyAttack();
		this.player.body.velocity.x = 0;
		this.player.body.velocity.y = 0;

		//Shooting & Building
		if(!this.player.building){
			this.handleShooting();		
		} else{
			this.handleBuilding();
		}

		//Handle inputs		
		if(this.game.input.keyboard.isDown){	
			this.handleKeyboardInput();
		}

		if(this.player.holdingBrain){
			this.brain.position.x = this.player.position.x - 8;
			this.brain.position.y = this.player.position.y - 8;
		}

		//Player movement
		this.player.rotation = this.game.physics.arcade.angleToPointer(this.player);			
		
		this.updateText();
		this.playerPushed();
		this.handleRound();

		//Collisions
		this.game.physics.arcade.collide(this.player, this.collisionLayer);
		//this.game.physics.arcade.collide(this.enemies, this.collisionLayer);
		this.spritesOverlapSolve();


		//Finds a path from enemy to player and updates its position			
		for(var i = 0; i < this.enemies.length; i++){
			this.moveEnemy(this.enemies[i]);			
		}
	
	},

	//----------ROUND LOOP METHODS--------------
	startRound: function(){
		if(this.timeBetweenRounds > 0){
			this.timeBetweenRounds -= 1;
			this.restTimer.add(1000, this.startRound, this);
		}else{
			this.restTimer.pause();
			this.restTimer.add(1000, this.startRound, this);
			this.resting = false; //Empieza la ronda
			for(var i = 0; i < this.zombiesPerRound ; i++){
				var zombie = this.createEnemy(150 + (i * 100), 30 + (i * 100), 'zombie');
			}
		}
	},

	handleRound: function(){
		if(this.enemies.length == 0 && this.resting == false){
			this.resting = true; //Empieza el tiempo de descanso
			this.timeBetweenRounds = 3;
			this.zombiesPerRound++;
			this.restTimer.resume();
			this.actualRound++;
		}
	},

	//-----------------METHODS-----------------
	//Calculates the enemy target position and calls find path
	moveEnemy: function(enemy){
		if(this.brain != null){
			if(Phaser.Point.distance(enemy.position, this.brain.position) < Phaser.Point.distance(enemy.position, this.player.position)){
				enemy.target = "brain";
			} else if (Phaser.Point.distance(enemy.position, this.brain.position) >= Phaser.Point.distance(enemy.position, this.player.position)){
				enemy.target = "player";
			}
		}

		var targetPosition;	
		if(enemy.target == "player"){			
			targetPosition = new Phaser.Point(this.player.position.x, this.player.position.y);		
			this.findPath(enemy.position, targetPosition, this.assignPath, enemy);	
		} else if (enemy.target == "building") {			
			this.findPathToBuilding(enemy);
		} else if (enemy.target == "brain"){				
			targetPosition = new Phaser.Point(this.brain.position.x, this.brain.position.y);		
			this.findPath(enemy.position, targetPosition, this.assignPath, enemy);	
		}
	},		

	//Updates an enemy position
	updateEnemy: function(enemy){
		enemy.rotation = this.game.physics.arcade.angleBetween(enemy, this.player);		
		var nextPosition, velocity;		
		if(enemy.path.length > 0){
			nextPosition = enemy.path[enemy.pathStep];			
			if(!this.reachedTargetPosition(nextPosition, enemy)){
				velocity = new Phaser.Point(nextPosition.x - enemy.position.x, nextPosition.y - enemy.position.y);
				velocity.normalize();
				enemy.body.velocity.x = velocity.x * enemy.walkingSpeed;
				enemy.body.velocity.y = velocity.y * enemy.walkingSpeed;				
			} else {
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

	//Returns an array with all the hotkeys
	createKeys: function(){
		return {
			up: this.game.input.keyboard.addKey(Phaser.Keyboard.W), 
			down: this.game.input.keyboard.addKey(Phaser.Keyboard.S), 
			left: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
			right: this.game.input.keyboard.addKey(Phaser.Keyboard.D),
			reload: this.game.input.keyboard.addKey(Phaser.Keyboard.R),
			one: this.game.input.keyboard.addKey(Phaser.Keyboard.ONE),
			two: this.game.input.keyboard.addKey(Phaser.Keyboard.TWO),
			three: this.game.input.keyboard.addKey(Phaser.Keyboard.THREE),
			build: this.game.input.keyboard.addKey(Phaser.Keyboard.E),
			grabBrain: this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
		};
	},

	//Handles the keyboard input
	handleKeyboardInput: function(){
		//Movement
		if(this.actionKeys.left.isDown){	
			this.player.body.velocity.x -= this.player.speed;
		}
		else if(this.actionKeys.right.isDown){	
			this.player.body.velocity.x += this.player.speed;
		}
		if(this.actionKeys.up.isDown){	
			this.player.body.velocity.y -= this.player.speed;
		}		
		else if(this.actionKeys.down.isDown){
			this.player.body.velocity.y += this.player.speed;
		}

		//Reload
		if(this.actionKeys.reload.isDown){
			this.player.reloading = true;
			this.reloadTimer.resume();
		}

		//Weapons inventory
		if(this.actionKeys.one.isDown){
			this.player.weapon = 'pistol';
		} else if(this.actionKeys.two.isDown){
			this.player.weapon = 'ak';
		} else if(this.actionKeys.three.isDown){
			this.player.weapon = 'shotgun';
		}

		//Change player state to building
		if(this.actionKeys.build.isDown){
			if(!this.buildKeyJustPressed){
				this.player.building = !this.player.building;
				this.buildKeyJustPressed = true;		
				if(this.player.building){
					this.startBuilding();
				} else {
					this.endBuilding();
				}
			}		
		}

		if(this.actionKeys.build.isUp){
			this.buildKeyJustPressed = false;			
		}

		//Grab brain
		if(this.actionKeys.grabBrain.isDown){
			if(!this.grabBrainKeyJustPressed){
				this.player.holdingBrain = !this.player.holdingBrain;
				this.grabBrainKeyJustPressed = true;		
				if(this.player.holdingBrain){
					console.log("Holding brain");
					this.grabBrain();
				} else {
					console.log("Not holding brain");
					this.releaseBrain();
				}
			}	
		}

		if(this.actionKeys.grabBrain.isUp){
			this.grabBrainKeyJustPressed = false;			
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

	updateText: function(targetPosition, enemy){
		switch(this.player.weapon){
			case "pistol":
				this.reloadText.setText("Pistola:" + this.player.actualAmmo + "/" + this.pistol.magazine);
				break;

			case "shotgun":
				this.reloadText.setText("Escopeta:" + this.player.actualAmmo + "/" + this.shotgun.magazine);
				break;

			case "ak":
				this.reloadText.setText("AK:" + this.player.actualAmmo + "/" + this.ak.magazine);
				break;
		}

		if(this.player.reloading == true){
			this.reloadText.setText("RECARGANDO");
		} 

		this.playerPositionText.setText("Player position -> x: "+ Math.floor(this.player.position.x) + " | y: " + Math.floor(this.player.position.y));

		if(targetPosition != null){
			this.targetPositionText.setText("Target x: " + Math.floor(targetPosition.x) + " | y: " + Math.floor(targetPosition.y));
		}

		if(enemy != null){
			this.targetText.setText("Holding brain: " + this.player.holdingBrain);
		}		
		
		this.hpText.setText("HP:" + this.player.actualHp + "/" + this.player.hp);

		this.actualRoundText.setText("Ronda actual:" + this.actualRound)

		if(this.resting == true){
			this.restTimerText.setText("Countdown: "+this.timeBetweenRounds);
		}

	},

	//Sprite gets killed when colliding with other
	spriteKill: function(player,sprite){
		sprite.kill();
		player.weapon = sprite.name;
		player.actualAmmo = sprite.magazine;
	},

	//Recognize a colision between sprites
	spritesOverlapSolve: function(){
		this.game.physics.arcade.overlap(this.player, this.shotgun, this.spriteKill, null, this);
		this.game.physics.arcade.overlap(this.player, this.pistol, this.spriteKill, null, this);
		this.game.physics.arcade.overlap(this.player, this.ak, this.spriteKill, null, this);
		for(i = 0; i < this.enemyCount;i++){
			for(j = 0; j < this.shot.length;j++){
				this.game.physics.arcade.collide(this.shot[j], this.enemies[i], this.bulletZombieColision,null,this);
				this.game.physics.arcade.overlap(this.shot[j], this.enemies[i], this.bulletZombieColision,null,this);
			}
			this.game.physics.arcade.collide(this.player, this.enemies[i], this.playerZombieColision,null,this);
		}
	},

	playerZombieColision: function(player,zombie){
		player.beingPushed = true;
		var playerPush = this.game.physics.arcade.velocityFromRotation(zombie.rotation); //Calculamos la velocidad para empujar al jugador a partir de la rotación del zombie

		player.actualHp -= zombie.damage;
		if(player.actualHp <= 0){
			player.kill();
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
		if(this.player.beingPushed == true && this.game.physics.arcade.distanceBetween(this.player, this.player.zombiePushing) < 20){
			this.player.body.velocity.setTo(this.player.vectorPush.x *6 , this.player.vectorPush.y *6);	
		}else{
			this.player.beingPushed = false;
		}
	},

	
	//-----------------SHOOTING METHODS-----------------
	fire: function(weapon){
		if (this.game.time.now > weapon.nextFire && this.bullets.countDead() > 0)
   		{
        	weapon.nextFire = this.game.time.now + weapon.fireRate;	
			this.shot[weapon.power] = this.bullets.getFirstDead();
			this.shot[weapon.power].damage = weapon.damage;
        	this.shot[weapon.power].reset(this.player.x - 8, this.player.y - 8);
	       	this.game.physics.arcade.moveToPointer(this.shot[weapon.power], 300);

			this.player.actualAmmo -= weapon.power;
			
    	}

	},

	fireMultiple: function(weapon){
		if (this.game.time.now > weapon.nextFire && this.bullets.countDead() > 0)
   		{
        	weapon.nextFire = this.game.time.now + weapon.fireRate;
			weapon.fireRate = 0;
			var j = -1;

			for(i = 0;i < weapon.power;i++){
			
				this.shot[i] = this.bullets.getFirstDead();
				this.shot[i].damage = weapon.damage;
				this.shot[i].reset(this.player.x - 8, this.player.y - 8);
				
				if(i == 0){
					var angle = this.game.physics.arcade.angleToPointer(this.shot[i]);
				}else{
					var angle = this.game.physics.arcade.angleToPointer(this.shot[i]) + (j * this.shotgun.angle);
				}				
				this.shot[i].body.velocity.setToPolar(angle,weapon.speed);
				
				j = j*-1;
			}

			weapon.fireRate = 120;
			
			this.player.actualAmmo -= weapon.power;
			
    	}

	},

	reloadMethod: function(){
		switch(this.player.weapon){
			case "pistol":
				this.player.actualAmmo = this.pistol.magazine;
				break;

			case "shotgun":
				this.player.actualAmmo = this.shotgun.magazine;
				break;

			case "ak":
				this.player.actualAmmo = this.ak.magazine;
				break;
		}
		
		this.reloadTimer.pause();
		this.reloadTimer.add(2000, this.reloadMethod, this);
		this.reloadTimer.start();
		this.reloadTimer.pause();
		this.updateText();
		this.player.reloading = false; //Reseteamos el estado de recarga del jugador
	},

	handleShooting: function(){
		if (this.game.input.activePointer.isDown && this.player.actualAmmo > 0 && this.player.reloading == false)
    	{
			switch(this.player.weapon){
				case "pistol":
					this.fire(this.pistol);
					break;

				case "shotgun":
					this.fireMultiple(this.shotgun);
					break;

				case "ak":
					this.fire(this.ak);
					break;
			}
        	
   		}else if(this.game.input.activePointer.isDown && this.player.actualAmmo <= 0){ //Reloading
			this.player.reloading = true;
   			this.reloadTimer.resume();
		}
	},


	//-----------------PATHFINDING METHODS-----------------
	//Inits pathfinding
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
	startBuilding: function(){
		var vectorPlayerPointer;		

		vectorPlayerPointer = {
			x: this.game.input.mousePointer.worldX - this.player.position.x,
			y: this.game.input.mousePointer.worldY - this.player.position.y
		};

		vectorPlayerPointer = this.normalize(vectorPlayerPointer);

		this.wallPointer = this.game.add.sprite(0.1 * vectorPlayerPointer.x, 0.1 * vectorPlayerPointer.y, 'wallTile');
		this.wallPointer.anchor.setTo(0.5, 0.5);
		this.wallPointer.alpha = 0.6;	
	},

	handleBuilding: function(){
		var vectorPlayerPointer, buildingPosition, buildingCell, buildingPointer;
		var distanceToPlayer = 30;		

		vectorPlayerPointer = {
			x: this.game.input.mousePointer.worldX - this.player.position.x,
			y: this.game.input.mousePointer.worldY - this.player.position.y
		};

		vectorPlayerPointer = this.normalize(vectorPlayerPointer);

		buildingPointer = {
			x: this.player.position.x + vectorPlayerPointer.x * distanceToPlayer,
			y: this.player.position.y + vectorPlayerPointer.y * distanceToPlayer
		};			
		
		buildingCell = this.getCoordFromPosition(buildingPointer);

		this.wallPointer.position.x = buildingCell.column * this.tileDimensions.x + this.tileDimensions.x * 0.5;
		this.wallPointer.position.y = buildingCell.row * this.tileDimensions.y + this.tileDimensions.y * 0.5;	
		
		this.wallPointer.isAbleToBuild = true;

		if(buildingCell.row < 0) buildingCell.row = 0;
		if(buildingCell.row > 49) buildingCell.row = 49;
		if(buildingCell.column < 0) buildingCell.column = 0;
		if(buildingCell.column > 49) buildingCell.column = 49;

		if(this.map.layers[1].data[buildingCell.row][buildingCell.column].index != -1){
			isAbleToBuild = false;
			this.wallPointer.loadTexture('redWallTile', 0);
		} else {
			isAbleToBuild = true;
			this.wallPointer.loadTexture('wallTile', 0);
		}
		
		if(this.game.input.activePointer.isDown && isAbleToBuild){	
			this.build(buildingCell, this.wallPointer);				
		}
		
	},

	endBuilding:function(){
		this.wallPointer.kill();
	},

	//Returns a vector normalized
	normalize: function(vector){
		var norm = vector.x * vector.x + vector.y * vector.y;
		norm = Math.sqrt(norm);
	
		return{x: vector.x / norm, y: vector.y / norm};
	},

	build: function(buildingCell, wallPointer){
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

	//-----------------BRAIN METHODS-----------------
	grabBrain: function(){
		if(Phaser.Point.distance(this.player.position, this.brain.position) < 26){			
			return;
		}
		this.player.holdingBrain = false;
	},

	releaseBrain: function(){
		this.player.holdingBrain = false;
		this.brain.position = this.player.position;
	},
}	
