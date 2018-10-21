var Brainstein = Brainstein || {};
Brainstein.MainMenu = function(){};

Brainstein.MainMenu = {
	create: function(){
		//Show background					
		this.background = this.game.add.sprite(0, 0, 'mainMenuSplash');		
		this.background.width = (this.game.width);
		this.background.height = (this.game.height);

		//Start game text
		var text = "Press enter";
		var style = {font: "30px Arial", fill: '#000', align:"center"};
		var h = this.game.add.text(this.game.width / 2 - 130, this.game.height - 50, text, style);
	},

	update: function(){
		if(this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)){
			this.game.state.start('LevelSelection');
		}
	}


}