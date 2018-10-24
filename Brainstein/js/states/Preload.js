var Brainstein = Brainstein || {};
Brainstein.Preload = function(){};

Brainstein.Preload = {
	//Loading the game assets
	preload: function(){
		//Show logo in loading screen
		this.logo = this.add.sprite(this.game.world.centerX, this.game.world.center, 'logo');
		this.logo.anchor.setTo(0.5);
		this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY + 128, 'preloadBar');
		this.preloadBar.anchor.setTo(0.5);
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
		this.load.image('zombie', 'assets/images/zombie normal.png');	
		this.load.image('floor_tile', 'assets/images/debug-grid-1920x1920.png');		
	
		//this.load.image('bullet', 'assets/images/bala2_ph.png');	
		this.load.image('bullet', 'assets/images/bala_ph_dani.png');	
		this.load.image('brain', 'assets/images/cerebro sprite.png');
		this.load.image('drop','assets/images/drop sprite.png');
		this.load.image('deadPlayer', 'assets/images/tumba sprite.png');
		this.load.image('gameOverBanner', 'assets/images/defeat_banner.png');
		this.load.image('spawnPoint', 'assets/images/spawnPoint.png');
		this.load.image('arrow', 'assets/images/flecha.png');
	},

	create: function(){
		this.state.start('MainMenu');
	}
}
