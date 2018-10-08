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
		
		this.player.weapon = "pistol";
		this.player.actualAmmo = 12;

		this.zombie = this.game.add.sprite(this.game.world.centerX + 120, this.game.world.centerY, 'zombie')
		this.zombie.scale.setTo(0.2);
		this.zombie.hp = 10;

		//Create weapons
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

		//Mouse coordinates
		this.mouse_x = 0;
		this.mouse_y = 0;

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
		
    	this.player.reloading = false;

		this.bullets = this.game.add.group(); 
		this.bullets.enableBody = true;
   		this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
		this.bullets.createMultiple(50, 'bullet');
		this.bullets.setAll('anchor.x', 0.5);
		this.bullets.setAll('anchor.y', 0.5);
		//this.bullets.anchor.setTo(0.5, 0.5);   

    	this.bullets.setAll('checkWorldBounds', true);
		this.bullets.setAll('outOfBoundsKill', true);
		//this.bullets.scale.set(0.5);

		//Reload text
    	this.reloadText = this.game.add.text(0, 0, "Balas:" + this.player.actualAmmo + "/" + this.pistol.magazine, { font: "65px Arial", fill: "#ffff00", align: "center" });
    	this.reloadText.fixedToCamera = true;
    		//this.reloadText.cameraOffset = (0,0);

		//All animation here	

		
		//Enable player physics
		this.game.physics.startSystem(Phaser.Physics.ARCADE);		
		this.game.physics.arcade.enable(this.player);	
		this.game.physics.arcade.enable(this.zombie);
		this.game.physics.arcade.enable(this.shotgun);
		this.game.physics.arcade.enable(this.ak);	
		this.game.physics.arcade.enable(this.pistol);

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
        	
   		}else if(this.game.input.activePointer.isDown && this.player.actualAmmo <= 0){
			this.player.reloading = true;
   			this.reloadTimer.resume();
		}
		   
		//Colisions
		//Sprites overlap  
		this.spritesOverlapSolve();
	
		//Text
		this.actualizarTexto();

	},

	//Returns an array with all the hotkeys
	createKeys: function(){				
		return {up: this.game.input.keyboard.addKey(Phaser.Keyboard.W), down: this.game.input.keyboard.addKey(Phaser.Keyboard.S), left: this.game.input.keyboard.addKey(Phaser.Keyboard.A), right: this.game.input.keyboard.addKey(Phaser.Keyboard.D), r: this.game.input.keyboard.addKey(Phaser.Keyboard.R)};
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

		if(this.actionKeys.r.isDown){
			this.player.reloading = true;
			this.reloadTimer.resume();
		}
	},

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
				
				var angle = this.game.physics.arcade.angleToPointer(this.shot) + (j * i/2);
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
		this.actualizarTexto();
		this.player.reloading = false; //Reseteamos el estado de recarga del jugador
	},

	actualizarTexto: function(){
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

	enemyHit: function(bala, zombie){
		bala.kill();

		if(zombie.hp > 0){
			zombie.hp -= bala.damage;
		}
		if(zombie.hp <= 0){
			zombie.kill();
		}
		

	},

	spriteKill: function(player,sprite){
		sprite.kill();
		player.weapon = sprite.name;
		player.actualAmmo = sprite.magazine;
	},

	spritesOverlapSolve: function(){
		this.game.physics.arcade.overlap(this.player, this.shotgun, this.spriteKill, null, this);
		this.game.physics.arcade.overlap(this.player, this.pistol, this.spriteKill, null, this);
		this.game.physics.arcade.overlap(this.player, this.ak, this.spriteKill, null, this);
	},


	}

