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
		this.levelDimensions = {row: 50, column: 50};

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

		//Finds a path from enemy to player
		this.findPath(this.enemies[0].position.x, this.enemies[0].position.y, this.player.position.x, this.player.position.y);
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
		this.enemies[this.enemyCount] = zombie;
		this.enemyCount++;
	},

	 initPathfinding: function(){
		var grid = this.map.layers[1].data;
		this.easyStar.setGrid(grid);
		this.easyStar.setAcceptableTiles([0]);
	},

	//Converts a grid point to a grid coordinate
	getCoordFromPoint: function(point){
		var row, column;
		row = Math.floor(point.y / this.levelDimensions.y);
		column = Math.floor(point.x / this.levelDimensions.x);
		return {row: row, column: column};
	}, 

	//Converts a grid coordinate to a grid point
	getPointFromCoord: function(x1, y1){
		var x, y;
		x = (coord.column * this.levelDimensions.x) + (this.levelDimensions.x / 2);
		y = (coord.row * this.levelDimensions.y) + (this.levelDimensions.y / 2);
		return new Phaser.Point(x, y);
	},

	//Finds a path from an origin to a target
	findPath: function(x1, y1, x2, y2){	

		var originPoint = this.getCoordFromPoint(x1, y1);
		var targetPoint = this.getCoordFromPoint(x2, y2);

		if(!this.outsideGrid(originPoint.x, originPoint.y) && !this.outsideGrid(targetPoint.x, targetPoint.y)){
			this.easyStar.findPath(originPoint.x, originPoint.y, targetPoint.x, targetPoint.y, this.callBackFunction);
			this.easyStar.calculate();
			console.log("Path calculated")
		}		
	},

	//Returns if the coordinate is outside the grid
	outsideGrid: function(x, y){
		return x < 0 || x > this.levelDimensions.row - 1 || y < 0 || y > this.levelDimensions.column - 1;
	},

	callBackFunction: function(){
		console.log("Hi, I'm callBackFunction");
	}
}