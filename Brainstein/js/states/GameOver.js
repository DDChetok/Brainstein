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
		var text = "Press enter to begin";
		var style = {font: "30px Arial", fill: '#000', align:"center"};
		var h = this.game.add.text(this.game.width / 2 - 130, this.game.height - 50, text, style);
        this.camera.flash('#ff0000', 2000);
    },

    update: function(){
        return;
    }
}