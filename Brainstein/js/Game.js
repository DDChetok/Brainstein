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
		this.player.municionActual = 12;

		this.tontico = this.game.add.sprite(this.game.world.centerX + 120, this.game.world.centerY, 'zombie')
		this.tontico.scale.setTo(0.2);
		this.tontico.hp = 10;

		//Create escopeta
		this.escopeta = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY + 120, 'escopeta');
		this.escopeta.scale.setTo(0.2);

		this.powerEscopeta = 3;
		this.fireRateEscopeta = 50;
		this.cargadorEscopeta = 8;
		this.municionActual = this.cargadorEscopeta;

		//Create pistol
		this.nextFire = 0;

		this.fireRatePistol = 100;
		this.cargadorPistol = 12;

		this.recargaPistola = this.game.time.create(false);
		this.recargaPistola.add(2000, this.reloadPistol, this);
		this.recargaPistola.start();
		this.recargaPistola.pause();

		this.bullets = this.game.add.group(); 
		this.bullets.enableBody = true;
   		this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

   		this.bullets.createMultiple(50, 'bullet');
    	this.bullets.setAll('checkWorldBounds', true);
    	this.bullets.setAll('outOfBoundsKill', true);

    	this.player.reloading = false;

		//Reload text
    	this.reloadText = this.game.add.text(0, 0, "Balas:" + this.player.municionActual + "/" + this.cargadorPistol, { font: "65px Arial", fill: "#ffff00", align: "center" });
    	this.reloadText.fixedToCamera = true;
    		//this.reloadText.cameraOffset = (0,0);

		//All animation here	

		
		//Enable player physics
		this.game.physics.startSystem(Phaser.Physics.ARCADE);		
		this.game.physics.arcade.enable(this.player);	
		this.game.physics.arcade.enable(this.tontico);
		this.game.physics.arcade.enable(this.escopeta);	


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
		if (this.game.input.activePointer.isDown && this.player.municionActual > 0 && this.player.reloading == false)
    	{
        	this.fire();
   		}else if(this.game.input.activePointer.isDown && this.player.municionActual <= 0){
   			this.recargaPistola.resume();
		   }
		   
		//Colisiones
		this.game.physics.arcade.overlap(this.bulletPistol, this.tontico, this.enemyHit, null, this);
		  //this.game.physics.arcade.overlap(enemyBullets, player, enemyHitsPlayer, null, this);
		  
		this.game.physics.arcade.overlap(this.player, this.escopeta, this.spriteKill, null, this);

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
			this.recargaPistola.resume();
			//this.reloadPistol;
		}
	},

	fire: function(){
		if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
   		{
        	this.nextFire = this.game.time.now + this.fireRatePistol;

	        this.bulletPistol = this.bullets.getFirstDead();
			this.bulletPistol.damage = 5;

        	this.bulletPistol.reset(this.player.x - 8, this.player.y - 8);

	        this.game.physics.arcade.moveToPointer(this.bulletPistol, 300);

	        this.player.municionActual--;

	        //this.actualizarTexto();
    	}

	},

	reloadPistol: function(){
		this.player.municionActual = this.cargadorPistol;
		this.recargaPistola.pause();
		this.recargaPistola.add(2000, this.reloadPistol, this);
		this.recargaPistola.start();
		this.recargaPistola.pause();
		this.actualizarTexto();
		this.player.reloading = false; //Reseteamos el estado de recarga del jugador
	},

	actualizarTexto: function(){
		if(this.player.weapon == "pistol"){
			this.reloadText.setText("Balas:" + this.player.municionActual + "/" + this.cargadorPistol);
		}else if(this.player.weapon == "escopeta"){
			this.reloadText.setText("Balas:" + this.player.municionActual + "/" + this.cargadorEscopeta);
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
		player.weapon = "escopeta";
		player.municionActual = this.cargadorEscopeta;
	},



	}

