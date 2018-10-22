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
		this.load.tilemap('level1', 'assets/tilemaps/level1.json', null, Phaser.Tilemap.TILED_JSON);	
		this.load.tilemap('level2', 'assets/tilemaps/level2.json', null, Phaser.Tilemap.TILED_JSON);	
		this.load.tilemap('level3', 'assets/tilemaps/level3.json', null, Phaser.Tilemap.TILED_JSON);	

		//Images
		this.load.image('gameTiles', 'assets/images/open_tileset.png');
		this.load.image('mainMenuSplash','assets/images/main_menu.png');
		this.load.image('darwin', 'assets/images/darwin_sprite_ph.png');
		this.load.image('erwin', 'assets/images/erwin_sprite_ph_16px.png');
		this.load.image('zombie', 'assets/images/zombie_ph_16px.png');	
		this.load.image('floor_tile', 'assets/images/debug-grid-1920x1920.png');		
	
		this.load.image('bullet', 'assets/images/bala2_ph.png');
		this.load.image('shotgun', 'assets/images/escopeta_ph.png');	
		this.load.image('pistol', 'assets/images/pistol_ph.png');
		this.load.image('ak', 'assets/images/ak_ph.png');	
		this.load.image('wallTile', 'assets/images/wall_tile.png');
		this.load.image('redWallTile', 'assets/images/red_wall_tile.png');
		this.load.image('brain', 'assets/images/brain_ph.png');
		this.load.image('drop','assets/images/drop_ph.png');
		this.load.image('deadPlayer', 'assets/images/dead_player_ph.png');
		this.load.image('gameOverBanner', 'assets/images/defeat_banner.png');
		this.load.image('spawnPoint', 'assets/images/spawnPoint.png');
	},

	create: function(){
		this.state.start('MainMenu');
	}
}
