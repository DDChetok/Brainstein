var Brainstein = Brainstein || {};
Brainstein.MainMenu = function(){};

Brainstein.MainMenu = {
	create: function(){
		//Show background					
		this.background = this.game.add.sprite(0, 0, 'mainMenuSplashEnter');		
		this.background.width = (this.game.width);
		this.background.height = (this.game.height);
				
	},

	update: function(){
		if(this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)){
			this.game.state.start('LevelSelection');
		}
	}


}