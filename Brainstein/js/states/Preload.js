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
		this.load.tilemap('level3', 'assets/tilemaps/ratlabyrinth.json', null, Phaser.Tilemap.TILED_JSON);	

		//Images
		this.load.image('gameTiles', 'assets/images/tilesheet_complete_2X.png');
		this.load.image('mainMenuSplash','assets/images/menu_ppal.png');
		this.load.image('mainMenuSplashEnter','assets/images/menu_ppal.png');
		this.load.image('mainMenuFlat','assets/images/menu ppal 2.png');
		this.load.image('menuDarwin','assets/images/menu_darwin.png');
		this.load.image('menuErwin','assets/images/menu_erwin.png');

		this.load.image('pauseMenu','assets/images/pause_menu_ph.png');

		this.load.image('menuLvl1','assets/images/menu_lvl_1.png');
		this.load.image('menuLvl2','assets/images/menu_lvl_2.png');
		this.load.image('menuLvl3','assets/images/menu_lvl_3.png');
		this.load.image('darwin', 'assets/images/darwin pistol redim.png');
		this.load.image('erwin', 'assets/images/erwin pistol redim.png');
		this.load.image('darwinAk', 'assets/images/darwin rifle redim.png');
		this.load.image('erwinAk', 'assets/images/erwin rifle redim.png');
		this.load.image('erwinShotgun', 'assets/images/erwin shotgun redim.png');
		this.load.image('darwinShotgun', 'assets/images/darwin shotgun redim.png');			
		this.load.image('zombie', 'assets/images/zombie ajust redim.png');	
		this.load.image('floor_tile', 'assets/images/debug-grid-1920x1920.png');		
	
		this.load.image('bullet', 'assets/images/bala_ph.png');	
		this.load.image('bulletParticle', 'assets/images/bala_particula.png');		
		this.load.image('brain', 'assets/images/cerebro sprite redim.png');
		this.load.image('drop','assets/images/drop sprite redim.png');
		this.load.image('deadPlayer', 'assets/images/tumba sprite redim.png');
		this.load.image('gameOverBanner', 'assets/images/defeat_banner.png');	
		this.load.image('arrow', 'assets/images/flecha.png');
		this.load.image('healthBar', 'assets/images/barra_vida.png');
		this.load.image('redHealthBar', 'assets/images/barra_vida_roja.png');

		//Music
		this.load.audio('keyboardSound', 'assets/music/keyboard sound2.mp3');
		this.load.audio('mainMenuMusic', 'assets/music/main menu music2.mp3');
		this.load.audio('pressEnterSound', 'assets/music/press enter sound.mp3');
		this.load.audio('switchOptionSound', 'assets/music/switch option sound.mp3');
	},

	create: function(){
		this.state.start('MainMenu');
	}
}
