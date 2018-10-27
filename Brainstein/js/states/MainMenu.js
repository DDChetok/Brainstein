var Brainstein = Brainstein || {};
Brainstein.MainMenu = function(){};

Brainstein.MainMenu = {
	create: function(){
		//Show background					
		this.background = this.game.add.sprite(0, 0, 'mainMenuSplash');		
		this.background.width = (this.game.width);
		this.background.height = (this.game.height);

		//Start game text
		var text = " PRESS \nENTER";
		var style = {font: "60px Chakra Petch", fill: '#04f31d', align:"center"};
		//var h = this.game.add.text(this.game.width / 2 - 125, this.game.height - 65, text, style);
		var h = this.game.add.text(this.game.width / 2 -110, this.game.height/2, text, style);
	},

	update: function(){
		if(this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)){
			this.game.state.start('LevelSelection');
		}
	}


}