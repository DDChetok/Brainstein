var Brainstein = Brainstein || {};
Brainstein.LevelSelection = function(){};

Brainstein.LevelSelection = {
	create: function(){
		//Show background					
		this.background = this.game.add.sprite(0, 0, 'mainMenuSplash');		
		this.background.width = (this.game.width);
        this.background.height = (this.game.height);

        this.levels = ["Laboratorio", "Zombiehenge", "Ratlabyrinth"];
        
        this.levelSelected = 0;

		//Start game text
		var text = "Level selected: \n" + this.levels[this.levelSelected] + "\n<-  ->";
		var style = {font: "30px Chakra Petch", fill: '#04f31d', align:"center"};
		this.h = this.game.add.text(this.game.width / 2 - 100, this.game.height /2 + 20, text, style);
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
            this.h.text = ("Level selected: \n" + this.levels[this.levelSelected]+ "\n<-  ->");
            
        }
    
        if(this.game.input.keyboard.justPressed(Phaser.Keyboard.LEFT)){        
            this.levelSelected--;
            if(this.levelSelected < 0){
                this.levelSelected = this.levels.length - 1;
            }
            this.h.text = ("Level selected: \n" + this.levels[this.levelSelected]+ "\n<-  ->");              
        }     
	}


}
