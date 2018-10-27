var Brainstein = Brainstein || {};
Brainstein.Preload = function(){};

Brainstein.Preload = {
	//Loading the game assets
	preload: function(){
		//Show logo in loading screen
		this.logo = this.add.sprite(0, 0, 'logo');
		this.logo.width = this.game.width;
		this.logo.height = this.game.height;
		this.preloadBar = this.add.sprite(this.game.world.centerX - 130, this.game.world.height - 50 , 'preloadBar');	
		this.load.setPreloadSprite(this.preloadBar);

		//Load game assets
		//Levels
		this.load.tilemap('level1', 'assets/tilemaps/laboratorio.json', null, Phaser.Tilemap.TILED_JSON);	
		this.load.tilemap('level2', 'assets/tilemaps/zombiehenge.json', null, Phaser.Tilemap.TILED_JSON);	
		this.load.tilemap('level3', 'assets/tilemaps/level3.json', null, Phaser.Tilemap.TILED_JSON);	

		//Images
		this.load.image('gameTiles', 'assets/images/tilesheet_complete_2X.png');
		this.load.image('mainMenuSplash','assets/images/main_menu.png');
		this.load.image('darwin', 'assets/images/darwin pistol.png');
		this.load.image('erwin', 'assets/images/erwin pistol.png');
		this.load.image('darwinAk', 'assets/images/darwin rifle.png');
		this.load.image('erwinAk', 'assets/images/erwin rifle.png');
		this.load.image('erwinShotgun', 'assets/images/erwin shotgun.png');
		this.load.image('darwinShotgun', 'assets/images/darwin shotgun.png');			
		this.load.image('zombie', 'assets/images/zombie de dani.png');	
		this.load.image('floor_tile', 'assets/images/debug-grid-1920x1920.png');		
	
		this.load.image('bullet', 'assets/images/bala_ph_dani.jpg');	
		this.load.image('brain', 'assets/images/cerebro sprite.png');
		this.load.image('drop','assets/images/drop de dani.png');
		this.load.image('deadPlayer', 'assets/images/tumba sprite.png');
		this.load.image('gameOverBanner', 'assets/images/defeat_banner.png');	
		this.load.image('arrow', 'assets/images/flecha.png');
		this.load.image('healthBar', 'assets/images/barra_vida.png')
		this.load.image('redHealthBar', 'assets/images/barra_vida_roja.png')
	},

	create: function(){
		this.state.start('MainMenu');
	}
}
