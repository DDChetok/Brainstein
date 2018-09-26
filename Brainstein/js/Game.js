var Brainstein = Brainstein || {};
Brainstein.Game = function(){};

Brainstein.Game = {
	create: function(){
		//Set world dimension
		this.game.world.setBounds(0, 0, 3680, 1920);		
		this.background = this.game.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'floor_tile');
		
		//Create player
		this.player = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'erwin');		
		this.player.scale.setTo(0.2);
		this.player.anchor.setTo(0.5, 0.5);		

		this.tontico = this.game.add.sprite(this.game.world.centerX + 120, this.game.world.centerY, 'zombie')
		this.tontico.scale.setTo(0.2);

		//All animation here	

		//Enable player physics
		this.game.physics.startSystem(Phaser.Physics.ARCADE);		
		this.game.physics.arcade.enable(this.player);	
		this.game.physics.arcade.enable(this.tontico);	

		//Modify body properties
		this.player.collideWorldBounds = true;		
		this.player.speed = 7;

		//Create action keys
		this.actionKeys = this.createKeys();

		//FPS
		this.game.time.desiredFps = 30;

		//The camera will follow the player			
		this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_LOCKON, 0.05, 0.05);	
	},

	update: function(){
		//Handle inputs		
		if(this.game.input.keyboard.isDown){	
			this.handleKeyboardInput();
		}

		//Player movement
		this.player.rotation = this.game.physics.arcade.angleToPointer(this.player);		
	},

	//Returns an array with all the hotkeys
	createKeys: function(){				
		return {up: this.game.input.keyboard.addKey(Phaser.Keyboard.W), down: this.game.input.keyboard.addKey(Phaser.Keyboard.S), left: this.game.input.keyboard.addKey(Phaser.Keyboard.A), right: this.game.input.keyboard.addKey(Phaser.Keyboard.D)};
	},

	handleKeyboardInput: function(){
		if(this.actionKeys.left.isDown){	
			this.player.x -= this.player.speed;
		}
		else if(this.actionKeys.right.isDown){	
			this.player.x += this.player.speed;
		}

		if(this.actionKeys.up.isDown){	
			this.player.y -= this.player.speed;
		}		
		else if(this.actionKeys.down.isDown){
			this.player.y += this.player.speed;
		}
	}

	
}