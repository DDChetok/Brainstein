var Brainstein = Brainstein || {};
Brainstein.GameOver = function(){};

Brainstein.GameOver = {

    create: function(){
        //Show background					
        this.game.stage.backgroundColor = '#000';
		this.background = this.game.add.sprite(0, 0, 'gameOverBanner');		
		this.background.width = (this.game.width);
		this.background.height = (this.game.height);

		//Start game text
		var text = "Press F5 to retry";
		var style = {font: "50px Chakra Petch", fill: '#fff', align:"center"};
		var h = this.game.add.text(this.game.width / 2, this.game.height - 50, text, style);
		h.anchor.setTo(0.5, 0.5);
		this.camera.flash('#ff0000', 2000);
		
		this.gameOverSound = this.game.add.audio('gameOver');
		this.gameOverSound.play();
    },

    update: function(){
        
	}
}