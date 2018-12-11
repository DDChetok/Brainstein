var Brainstein = Brainstein || {};
Brainstein.GameOver = function(){};

var dataTypes = {
	PLAYER: 0,
	ENEMY: 1,
	SHOT: 2,
	DROP: 3,
	BRAIN: 4,
	NEW_ENEMY: 5,
	RESURRECT: 6,
	ENTERINGMATCHMAKING: 7,
    CHECKOTHERPLAYERS: 8,
	CHANGELEVEL: 9,
	GAMEOVER: 10
}

Brainstein.GameOver = {

    create: function(){

		var message = {
			dataType: dataTypes.GAMEOVER
		}

		message = JSON.stringify(message);

		connection.send(message);

        //Show background					
        this.game.stage.backgroundColor = '#000';
		this.background = this.game.add.sprite(0, 0, 'gameOverBanner');		
		this.background.width = (this.game.width);
		this.background.height = (this.game.height);

		//Start game text
		var text = "Press R to retry";
		var style = {font: "50px Chakra Petch", fill: '#fff', align:"center"};
		var h = this.game.add.text(this.game.width / 2, this.game.height - 50, text, style);
		h.anchor.setTo(0.5, 0.5);
		this.camera.flash('#ff0000', 2000);
		
		this.gameOverSound = this.game.add.audio('gameOver');
		this.gameOverSound.play();
    },

    update: function(){
		if(this.game.input.keyboard.isDown(Phaser.Keyboard.R)){
			this.gameOverMusic.stop();
			this.game.state.start('MainMenu');			
		}
	}
}