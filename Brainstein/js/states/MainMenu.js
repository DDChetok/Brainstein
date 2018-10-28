var Brainstein = Brainstein || {};
Brainstein.MainMenu = function(){};

Brainstein.MainMenu = {
	create: function(){
		//Show background					
		this.background = this.game.add.sprite(0, 0, 'mainMenuSplashEnter');		
		this.background.width = (this.game.width);
		this.background.height = (this.game.height);
		var style = {font: "30px Chakra Petch", fill: '#04f31d', align:"center"};
        this.h = this.game.add.text(this.game.width / 2 - 100, this.game.height /2 + 20, "  ", style);
				
	},

	update: function(){
		if(this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)){
			this.game.state.start('LevelSelection');
		}
	}


}