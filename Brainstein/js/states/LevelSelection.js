var Brainstein = Brainstein || {};
Brainstein.LevelSelection = function(){};

Brainstein.LevelSelection = {
	create: function(){
		//Show background					
		this.background = this.game.add.sprite(0, 0, 'mainMenuSplash');		
		this.background.width = (this.game.width);
        this.background.height = (this.game.height);

        this.levels = ["level1", "level2", "level3"];
        
        this.levelSelected = 0;

		//Start game text
		var text = "Level selected: " + this.levels[this.levelSelected];
		var style = {font: "30px Arial", fill: '#000', align:"center"};
		this.h = this.game.add.text(this.game.width / 2 - 130, this.game.height - 50, text, style);
	},

	update: function(){
		if(this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)){
			this.game.state.start('Game');
        }
        
        if(this.game.input.keyboard.justPressed(Phaser.Keyboard.RIGHT)){         
            this.levelSelected++;
            if(this.levelSelected > this.levels.length - 1){
                this.levelSelected = 0;
            }
            this.h.text = ("Level selected: " + this.levels[this.levelSelected]);
            
        }
    
        if(this.game.input.keyboard.justPressed(Phaser.Keyboard.LEFT)){        
            this.levelSelected--;
            if(this.levelSelected < 0){
                this.levelSelected = this.levels.length - 1;
            }
            this.h.text = ("Level selected: " + this.levels[this.levelSelected]);              
        }     
	}


}
