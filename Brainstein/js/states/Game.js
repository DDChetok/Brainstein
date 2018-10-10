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

		//-----------------PLAYER VARIABLES-----------------
		//Create player
		this.player = this.game.add.sprite(20, 150, 'erwin');		
		//this.player.scale.setTo(0.05);
		this.player.anchor.setTo(0.5, 0.5);			
		this.player.weapon = "pistol";
		this.player.building = false;
		this.player.actualAmmo = 12;	
		this.player.reloading = false;

		//Modify body properties
		this.player.collideWorldBounds = true;		
		this.player.speed = 200;

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
		this.createEnemy(352, 150, 'zombie');	

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

		//Text
		this.reloadText = this.game.add.text(0, 0, "Balas:" + this.player.actualAmmo + "/" + this.pistol.magazine, { font: "65px Arial", fill: "#ffff00", align: "center" });
		this.reloadText.fixedToCamera = true;

		//Keyboard
		this.keyJustPressed = false;

		//-----------------BUILDING VARIABLES-----------------		
		this.destructableBuildings = [];
		this.destructableBuildingsCount = 0;


		
	},

	update: function(){
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

		//Player movement
		this.player.rotation = this.game.physics.arcade.angleToPointer(this.player);			
		
		this.updateText();

		//Collisions
		this.game.physics.arcade.collide(this.player, this.collisionLayer);
		this.spritesOverlapSolve();

		//Finds a path from enemy to player and updates its position			
		for(var i = 0; i < this.enemies.length; i++){
			this.moveEnemy(this.enemies[i]);			
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
		return {
			up: this.game.input.keyboard.addKey(Phaser.Keyboard.W), 
			down: this.game.input.keyboard.addKey(Phaser.Keyboard.S), 
			left: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
			right: this.game.input.keyboard.addKey(Phaser.Keyboard.D),
			reload: this.game.input.keyboard.addKey(Phaser.Keyboard.R),
			one: this.game.input.keyboard.addKey(Phaser.Keyboard.ONE),
			two: this.game.input.keyboard.addKey(Phaser.Keyboard.TWO),
			three: this.game.input.keyboard.addKey(Phaser.Keyboard.THREE),
			build: this.game.input.keyboard.addKey(Phaser.Keyboard.E)
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

		//Change player state		
		if(this.actionKeys.build.isDown){
			if(!this.keyJustPressed){
				this.player.building = !this.player.building;
				this.keyJustPressed = true;		
				if(this.player.building){
					this.startBuilding();
				} else {
					this.endBuilding();
				}
			}			
		}

		if(this.actionKeys.build.isUp){
			this.keyJustPressed = false;			
		}
		
	},

	//Creates an enemy
	createEnemy: function(x, y, texture){
		var zombie = this.game.add.sprite(x, y, texture); 
		this.game.physics.arcade.enable(zombie);
		//zombie.scale.setTo(0.05);
		zombie.anchor.setTo(0.5, 0.5);
		zombie
		zombie.walkingSpeed = 70;
		zombie.body.collideWorldBounds = true;
		zombie.path = [];
		zombie.pathStep = -1;	
		zombie.hp = 10;	
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
	},
	
	//-----------------SHOOTING METHODS-----------------
	fire: function(weapon){
		if (this.game.time.now > weapon.nextFire && this.bullets.countDead() > 0)
   		{
        	weapon.nextFire = this.game.time.now + weapon.fireRate;	
			this.shot = this.bullets.getFirstDead();
			this.shot.damage = weapon.damage;
        	this.shot.reset(this.player.x - 8, this.player.y - 8);
	       	this.game.physics.arcade.moveToPointer(this.shot, 300);

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
			
				this.shot = this.bullets.getFirstDead();
				this.shot.damage = weapon.damage;
				this.shot.reset(this.player.x - 8, this.player.y - 8);
				
				if(i == 0){
					var angle = this.game.physics.arcade.angleToPointer(this.shot);
				}else{
					var angle = this.game.physics.arcade.angleToPointer(this.shot) + (j * this.shotgun.angle);
				}				
				this.shot.body.velocity.setToPolar(angle,weapon.speed);
				
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
		if(path !== null){
			path.forEach(function(pathCoord){
				pathPositions.push(this.getPositionFromCoord({row: pathCoord.x, column: pathCoord.y}));
			}, this);
		} else{			
			var targetWallCell, minDistance = Number.MAX_SAFE_INTEGER;
			for(var i = 0; i < this.destructableBuildingsCount; i++){
				var distance = Phaser.Point.distance(enemy.position, this.destructableBuildings[i].position);
				if(distance < minDistance){
					minDistance = distance;
				}
			}

			for(var i = 0; i < this.destructableBuildingsCount; i++){
				var distance = Phaser.Point.distance(enemy.position, this.destructableBuildings[i].position);
				if(distance == minDistance){
					this.findPath(enemy.position, this.destructableBuildings[i].position, this.assignPath, enemy);
					console.log("Finding another path");
				}
			}
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
		wall = {
			row: buildingCell.row,
			column: buildingCell.column
		}
		wall.position = position;

		this.map.layers[1].data[wall.row][wall.column].index = 2;		
		this.initPathfinding();
		this.setCollisionLayer();
		this.destructableBuildings[this.destructableBuildingsCount] = wall;
		this.destructableBuildingsCount++;
	},

	setCollisionLayer: function(){
		this.map.setCollisionBetween(1, 100, true, 'collisionLayer');
	},
}	
