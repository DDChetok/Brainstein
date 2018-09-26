var Brainstein = Brainstein || {};
Brainstein.Boot = function(){};

//Setting game configuration and loading the assets for the loading screen
Brainstein.Boot = {
	preload: function(){
		//Assets we'll use in the loading screen
		this.load.image('logo', 'assets/images/logo_ph.png');
		this.load.image('preloadBar', 'assets/images/preloader_bar_ph.png');
	},
	create: function(){
		//Loading screen will have a white color
		this.game.stage.backgroundColor = '#fff';

		//Scaling options
		//this.scale.scaleMode = Phaser.ScaleManager.RESIZE;	//Changes the game size to match the display size
		this.scale.minWidth = 240;
		this.scale.maxHeight = 170;
		this.scale.maxWidth = 2880;
		this.scale.maxHeight = 1920;

		//Have the game centered horizontally
		this.scale.pageAlignHorizontally = true;

		//Screen size will be set automatically
		
		//Physics system for movement
		//this.game.physics.startSystem(Phaser.Physics.ARCADE);

		this.state.start('Preload');
	}

}