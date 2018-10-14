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
		this.map.setCollisionBetween(1, 100, true, 'collisionLayer');
		//Resizes the game world to match the layer dimensions
		this.backgroundLayer.resizeWorld();

		//-----------------WEAPON VARIABLES-----------------
		//Pistol
		this.pistol = this.game.add.sprite(this.game.world.centerX - 180, this.game.world.centerY, 'pistol');
		this.pistol.scale.setTo(0.1);
		this.pistol.nextFire = 0;
		this.pistol.fireRate = 100;
		this.pistol.magazine = 12;
		this.pistol.power = 1;
		this.pistol.damage = 5;
		this.pistol.name = "pistol";
		//Shotgun
		this.shotgun = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY + 120, 'shotgun');
		this.shotgun.scale.setTo(0.2);
		this.shotgun.nextFire = 0;
		this.shotgun.fireRate = 120;
		this.shotgun.magazine = 12;
		this.shotgun.power = 3;
		this.shotgun.damage = 8;
		this.shotgun.name = "shotgun";
		this.shotgun.speed = 300;
		this.shotgun.angle = 0.25;
		//AK
		this.ak = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY - 120, 'ak');
		this.ak.scale.setTo(0.2);
		this.ak.nextFire = 0;
		this.ak.fireRate = 50;
		this.ak.magazine = 30;
		this.ak.power = 1;
		this.ak.damage = 8;
		this.ak.name = "ak";
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
		
		this.player.hp = 30;
		this.player.actualHp = this.player.hp;
		this.player.weapon = "pistol";
		this.player.actualAmmo = 12;	
		this.player.reloading = false;
		this.player.beingPushed = false;
		this.player.vectorPush;
		this.player.zombiePushing;

		//Create text
		this.reloadText = this.game.add.text(0, 0, "Balas:" + this.player.actualAmmo + "/" + this.pistol.magazine, { font: "65px Arial", fill: "#ffff00", align: "center" });
		this.reloadText.fixedToCamera = true;
		this.hpText = this.game.add.text(0, 500, "HP:" + this.player.actualHp + "/" + this.player.hp, { font: "65px Arial", fill: "#faaa00", align: "center" });
		this.hpText.fixedToCamera = true;
		
		//All animation here	

		//Enable player physics
		this.game.physics.startSystem(Phaser.Physics.ARCADE);		
		this.game.physics.arcade.enable(this.player);	
		this.player.body.collideWorldBounds = true;
		//this.game.physics.arcade.enable(this.enemies);	

		//Modify body properties
		this.player.collideWorldBounds = true;		
		this.player.speed = 200;

		////-----------------ENEMIES VARIABLES-----------------
		//Enemies
		this.enemies = [];
		this.enemyCount = 0;
		//this.createEnemy(152, 32, 'zombie');		

		//-----------------PATHFINDING VARIABLES-----------------
		this.easyStar = new EasyStar.js();
		this.initPathfinding();

		//-----------------ADITIONAL VARIABLES-----------------
		//Create action keys
		this.actionKeys = this.createKeys();
		
		//FPS
		this.game.time.desiredFps = 30;

		//The camera will follow the player			
		this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_LOCKON, 0.05, 0.05);	

		//-----------------ROUND LOOP VARIABLES-----------------
		this.timeBetweenRounds = 2; //Tiempo entre rondas(numero)
		
		this.restTimer = this.game.time.create(false); //Timer entre rondas(objeto timer)
		this.restTimer.add(1000, this.startRound, this);
		this.restTimer.start();

		this.restTimerText = this.game.add.text(500, 500, this.timeBetweenRounds, { font: "65px Arial", fill: "#faaa00", align: "center" });
		
		this.zombiesPerRound = 3;

		this.resting = true;

		this.actualRound = 0;
		this.actualRoundText = this.game.add.text(300, 0, "Ronda actual:" + this.actualRound, { font: "65px Arial", fill: "#40FF00", align: "center" });

	},

	update: function(){
		this.player.body.velocity.x = 0;
		this.player.body.velocity.y = 0;

		//Handle inputs		
		if(this.game.input.keyboard.isDown){	
			this.handleKeyboardInput();
		}

		//Player movement
		this.player.rotation = this.game.physics.arcade.angleToPointer(this.player);	
		
		//Shooting
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
		
		this.spritesOverlapSolve();
		this.updateText();
		this.playerPushed();
		this.handleRound();

		//Collisions
		this.game.physics.arcade.collide(this.player, this.collisionLayer);


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
		var targetPosition;
		targetPosition = new Phaser.Point(this.player.position.x, this.player.position.y);
		this.findPath(enemy.position, targetPosition, this.assignPath, enemy);	
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
	},	

	//Returns an array with all the hotkeys
	createKeys: function(){				
		return {up: this.game.input.keyboard.addKey(Phaser.Keyboard.W), down: this.game.input.keyboard.addKey(Phaser.Keyboard.S), left: this.game.input.keyboard.addKey(Phaser.Keyboard.A), right: this.game.input.keyboard.addKey(Phaser.Keyboard.D), r: this.game.input.keyboard.addKey(Phaser.Keyboard.R)};
	},

	//Handles the keyboard input
	handleKeyboardInput: function(){
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

		if(this.actionKeys.r.isDown){
			this.player.reloading = true;
			this.reloadTimer.resume();
		}
	},

	//Creates an enemy
	createEnemy: function(x, y, texture){
		var zombie = this.game.add.sprite(x, y, texture); 
		this.game.physics.arcade.enable(zombie);
		//zombie.scale.setTo(0.05);
		zombie.anchor.setTo(0.5, 0.5);
		zombie.walkingSpeed = 70;
		zombie.body.collideWorldBounds = true;
		zombie.path = [];
		zombie.pathStep = -1;	
		zombie.hp = 10;
		zombie.actualHp = zombie.hp;	
		zombie.damage = 5;
		zombie.pos = this.enemyCount;
		this.enemies[this.enemyCount] = zombie;		
		this.enemyCount++;
	},

	updateText: function(){
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
		
		this.hpText.setText("HP:" + this.player.actualHp + "/" + this.player.hp);

		this.actualRoundText.setText("Ronda actual:" + this.actualRound)

		if(this.resting == true){
			this.restTimerText.setText(this.timeBetweenRounds);
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


	//-----------------PATHFINDING METHODS-----------------
	//Inits pathfinding
	initPathfinding: function(){
		var gridIndices = [];
		
		for(var i = 0; i < this.levelDimensions.rows; i++){
			gridIndices[i] = [this.levelDimensions.columns];
			for(var j = 0; j < this.levelDimensions.columns; j++){
				gridIndices[i][j] = this.map.layers[1].data[j][i].index;
			}
		}

		this.easyStar.setGrid(gridIndices);
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
			path.forEach(function(pathCoord){
				pathPositions.push(this.getPositionFromCoord({row: pathCoord.x, column: pathCoord.y}));
			}, this);
		}
		callback.call(enemy, pathPositions, enemy);	
		this.updateEnemy(enemy);		
	},	

	//Returns if the subject has reached the target position
	reachedTargetPosition: function(targetPosition, subject){
		var distance;
		distance = Phaser.Point.distance(subject.position, targetPosition);
		return distance < 1;
	},

	//Finds a path from an origin to a target
	findPath: function(originPosition, targetPosition, callback, enemy){	

		var originCoord = this.getCoordFromPosition(originPosition);
		var targetCoord = this.getCoordFromPosition(targetPosition);

		if(!this.outsideGrid(originCoord) && !this.outsideGrid(targetCoord)){			
			this.easyStar.findPath(originCoord.row, originCoord.column, targetCoord.row, targetCoord.column, this.callbackFunction.bind(this, callback, enemy));
			this.easyStar.calculate();
			return true;				
		} else {
			return false;
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


}	
