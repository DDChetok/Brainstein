var Brainstein = Brainstein || {};
Brainstein.LevelSelection = function(){};

Brainstein.LevelSelection = {    
	create: function(){
		//Show background					
		this.background = this.game.add.sprite(0, 0, 'mainMenuSplash');		
		this.background.width = (this.game.width);
        this.background.height = (this.game.height);

        this.levels = ["Laboratorio", "Zombiehenge", "Ratlabyrinth"];

        this.chooseLevelText = this.game.add.text(this.game.width / 2, 50, " ", { font: "40px Chakra Petch", fill: "#0a2239", align: "center" });
        this.chooseLevelText.anchor.setTo(0.5);
        
        this.levelSelected = 0;
        if(Brainstein.userID == 0){
            this.chooseLevelText.setText("Choose a level");
        }else{
            this.chooseLevelText.setText("Your partner is choosing a level");
        }
        
        
	},

	update: function(){
        //Player who choses
        if(Brainstein.userID == 0){
            if(this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)){

                var levelSelected = JSON.stringify(-1);

                $.ajax("/levelSelection", 
                {
                    method: "POST",
                    data:  levelSelected,
                    processData: false,					
                    
                    headers:{
                        "Content-Type": "application/json"
                    },
                });

                this.game.switchOptionSound.play();
                this.game.state.start('Game');
            }
            
            if(this.game.input.keyboard.justPressed(Phaser.Keyboard.RIGHT)){         
                this.levelSelected++;
                this.game.switchOptionSound.play();
                if(this.levelSelected > this.levels.length - 1){
                    this.levelSelected = 0;
                }       

                var levelSelected = JSON.stringify(this.levelSelected);

                $.ajax("/levelSelection", 
                {
                    method: "POST",
                    data:  levelSelected,
                    processData: false,					
                    
                    headers:{
                        "Content-Type": "application/json"
                    },
                });
            }

            if(this.game.input.keyboard.justPressed(Phaser.Keyboard.LEFT)){        
                this.levelSelected--;
                this.game.switchOptionSound.play();
                if(this.levelSelected < 0){
                    this.levelSelected = this.levels.length - 1;
                }

                var levelSelected = JSON.stringify(this.levelSelected);

                $.ajax("/levelSelection", 
                {
                    method: "POST",
                    data:  levelSelected,
                    processData: false,					
                    
                    headers:{
                        "Content-Type": "application/json"
                    },
                })
            }
            
            switch(this.levelSelected){
                case 0:
                    this.background.loadTexture('menuLvl1');
                    break;
                case 1:   
                    this.background.loadTexture('menuLvl2');
                    break;
                case 2:
                    this.background.loadTexture('menuLvl3');
                    break;     
            }
        } else {      
            $.get("/levelSelection", function(currentLevel){
                switch(currentLevel){
                    case -1:
                        Brainstein.game.state.start("Game");
                        break;
                    case 0:
                        Brainstein.LevelSelection.background.loadTexture('menuLvl1');
                        break;
                    case 1:   
                        Brainstein.LevelSelection.background.loadTexture('menuLvl2');
                        break;
                    case 2:
                        Brainstein.LevelSelection.background.loadTexture('menuLvl3');
                        break;     

                }

                if(Brainstein.LevelSelection.levelSelected != currentLevel ){
                    Brainstein.game.switchOptionSound.play();
                }

                if(currentLevel != -1){
                    Brainstein.LevelSelection.levelSelected = currentLevel;
                }
            })
        }
    }
}

