var Brainstein = Brainstein || {};
Brainstein.Game = function(){};

Brainstein.Game = {	
	create: function(){		
		//-----------------WORLD & LEVEL VARIABLES-----------------
		//Set world dimension
		this.game.world.setBounds(0, 0, 800, 800);		
		//this.background = this.game.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'floor_tile');

		//Create Tiled map
		this.map = this.game.add.tilemap('level1');
		//The first parameter is the tileset name as specified in Tiled, the second is the key to the asset
		this.map.addTilesetImage('tileset', 'gameTiles');
		this.levelDimensions = {rows: 50, columns: 50};

		//Create map layers
		this.backgroundLayer = this.map.createLayer('backgroundLayer');
		this.collisionLayer = this.map.createLayer('collisionLayer');
		//Collision on blockedLayer
		this.map.setCollisionBetween(1, 100, true, 'collisionLayer');
		//Resizes the game world to match the layer dimensions
		this.backgroundLayer.resizeWorld();

		//-----------------PLAYER VARIABLES-----------------
		//Create player
		this.player = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'erwin');		
		this.player.scale.setTo(0.1);
		this.player.anchor.setTo(0.5, 0.5);		

		//All animation here	

		//Enable player physics
		this.game.physics.startSystem(Phaser.Physics.ARCADE);		
		this.game.physics.arcade.enable(this.player);	
		//this.game.physics.arcade.enable(this.enemies);	

		//Modify body properties
		this.player.collideWorldBounds = true;		
		this.player.speed = 200;

		////-----------------ENEMIES VARIABLES-----------------
		//Enemies
		this.enemies = [];
		this.enemyCount = 0;
		this.createEnemy(this.game.world.centerX + 200, this.game.world.centerY, 'zombie');

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
		
		//Collisions
		this.game.physics.arcade.collide(this.player, this.collisionLayer);

		//Finds a path from enemy to player and updates its position			
		for(var i = 0; i < this.enemies.length; i++){
			this.moveEnemy(this.enemies[i]);			
		}
	},

	moveEnemy: function(enemy){
		var targetPosition;
		targetPosition = new Phaser.Point(this.player.position.x, this.player.position.y);
		this.moveTo(enemy, targetPosition);
	},

	moveTo: function(enemy, targetPosition){
		this.findPath(enemy.position, targetPosition, this.moveThroughPath, enemy);	
	},	

	//Finds a path from an origin to a target
	findPath: function(originPosition, targetPosition, callback, context){	

		var originCoord = this.getCoordFromPosition(originPosition);
		var targetCoord = this.getCoordFromPosition(targetPosition);

		if(!this.outsideGrid(originCoord) && !this.outsideGrid(targetCoord)){
			this.easyStar.findPath(originCoord.row, originCoord.column, targetCoord.row, targetCoord.column, this.callbackFunction.bind(this, callback, context));
			this.easyStar.calculate();
			return true;				
		} else {
			return false;
		}
	},

	moveThroughPath: function(path, enemy){
		if(path !== null){
			enemy.path = path;
			enemy.pathStep = 1;
		} else {
			this.path = [];
		}
	},

	updateEnemy: function(enemy){		
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
		return {up: this.game.input.keyboard.addKey(Phaser.Keyboard.W), down: this.game.input.keyboard.addKey(Phaser.Keyboard.S), left: this.game.input.keyboard.addKey(Phaser.Keyboard.A), right: this.game.input.keyboard.addKey(Phaser.Keyboard.D)};
	},

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
	},

	createEnemy: function(x, y, texture){
		var zombie = this.game.add.sprite(x, y, texture); 
		zombie.scale.setTo(0.1);
		zombie.walkingSpeed = 70;
		zombie.path = [];
		zombie.path = -1;
		this.game.physics.arcade.enable(zombie);	
		this.enemies[this.enemyCount] = zombie;		
		this.enemyCount++;
	},

	initPathfinding: function(){
		var gridRow, gridColumn, gridIndices = [];
		for(gridRow = 0; gridRow < this.levelDimensions.rows; gridRow++){
			gridIndices[gridRow] = [];
			for(gridColumn = 0; gridColumn < this.levelDimensions.columns; gridColumn++){
				gridIndices[gridRow][gridColumn] = this.map.layers[1].data[gridRow][gridColumn].index;
			}
		}
		this.easyStar.setGrid(gridIndices);
		this.easyStar.setAcceptableTiles([-1]);
	},

	//Converts a grid position to a grid coordinate
	getCoordFromPosition: function(position){
		var row, column;
		row = Math.floor(position.x / this.levelDimensions.rows);
		column = Math.floor(position.y / this.levelDimensions.columns);
		return {row: row, column: column};
	}, 

	//Converts a grid coordinate to a grid position
	getPositionFromCoord: function(coord){
		var x, y;
		x = (coord.row * this.levelDimensions.rows) + (this.levelDimensions.rows / 2);
		y = (coord.column * this.levelDimensions.columns) + (this.levelDimensions.columns / 2);
		return new Phaser.Point(x, y);
	},	

	//Returns if the coordinate is outside the grid
	outsideGrid: function(coord){
		return coord.row < 0 || coord.row > this.levelDimensions.rows - 1 || coord.column < 0 || coord.column > this.levelDimensions.columns - 1;
	},

	//Creates an array with all the path positions in path
	callbackFunction: function(callback, context, path){
		var pathPositions = [];
		if(path !== null){
			path.forEach(function(pathCoord){
				pathPositions.push(this.getPositionFromCoord({row: pathCoord.x, column: pathCoord.y}));
			}, this);
		}
		callback.call(context, pathPositions, context);	
		this.updateEnemy(context);		
	},	

	reachedTargetPosition: function(targetPosition, subject){
		var distance;
		distance = Phaser.Point.distance(subject.position, targetPosition);
		return distance < 1;
	}
}	
