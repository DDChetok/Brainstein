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
		//TENEMOS QUE INVESTIGAR UNA FORMA DE NO TENER QUE METER 1 A 1 TODOS
		this.load.image('mainMenuSplash','assets/images/main_menu.png');
		this.load.image('darwin', 'assets/images/darwin_sprite_ph.png');
		this.load.image('erwin', 'assets/images/erwin_sprite_ph.png');
		this.load.image('zombie', 'assets/images/zombie_ph.png');	
		this.load.image('floor_tile', 'assets/images/debug-grid-1920x1920.png');
		this.load.image('bullet', 'assets/images/bala_ph.jpg');
		this.load.image('shotgun', 'assets/images/escopeta_ph.png');	
		this.load.image('pistol', 'assets/images/pistol_ph.png');
		this.load.image('ak', 'assets/images/ak_ph.png');	

		//this.bullet.anchor.setTo(0.5, 0.5);
	},

	create: function(){
		this.state.start('MainMenu');
	}
}


