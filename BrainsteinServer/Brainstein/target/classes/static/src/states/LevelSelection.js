var Brainstein = Brainstein || {};
Brainstein.LevelSelection = function(){};

var num = 0;
var aux = 0;

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
    CHANGELEVEL: 9
}

Brainstein.LevelSelection = {    
	create: function(){
		//Show background					
		this.background = this.game.add.sprite(0, 0, 'menuLvl1');		
		this.background.width = (this.game.width);
        this.background.height = (this.game.height);

        this.menuErwin = this.game.add.sprite(-5,-30, 'menuErwin');
        this.menuErwin.width = (this.game.width / 3);
        this.menuErwin.height = (this.game.height + this.game.height *0.2 );

        this.menuDarwin = this.game.add.sprite(this.game.width *2/3,-30, 'menuDarwin');	
        this.menuDarwin.width = (this.game.width / 3);
        this.menuDarwin.height = (this.game.height + this.game.height *0.2);
        //fire animation
        this.fuego = this.game.add.sprite(this.game.width * 0.05,this.game.height *0.45, 'fuego');
        this.fuego.alpha = 0.4;
        this.fuego.animations.add('arde');
        this.fuego.animations.play('arde', 50, true);
 
        this.fuego2 = this.game.add.sprite(this.game.width * 0.85 ,this.game.height /2, 'fuego');
        this.fuego2.alpha = 0.4;
        this.fuego2.animations.add('arde2');
        this.fuego2.animations.play('arde2', 50, true);

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
        this.menuErwin.y = this.menuErwin.y + Math.sin(num);
		this.menuErwin.x = this.menuErwin.x + Math.cos(num);
		this.menuDarwin.y = this.menuDarwin.y + Math.cos(num);
		this.menuDarwin.x = this.menuDarwin.x + Math.sin(num);
        num += 0.8;
        //Player who choses
        if(Brainstein.userID == 0){
            if(this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)){

                var level = {
                    dataType: dataTypes.CHANGELEVEL,
                    level: -1                    
                }

                connection.send(JSON.stringify(level));

                this.game.switchOptionSound.play();
                this.game.state.start('Game');
            }

            
            if(this.game.input.keyboard.justPressed(Phaser.Keyboard.RIGHT)){         
                this.levelSelected++;
                this.game.switchOptionSound.play();

                if(this.levelSelected > this.levels.length - 1){
                    this.levelSelected = 0;
                }       

              
                var level = {
                    dataType: dataTypes.CHANGELEVEL,
                    level: this.levelSelected                    
                }

                connection.send(JSON.stringify(level));

            }

            if(this.game.input.keyboard.justPressed(Phaser.Keyboard.LEFT)){        
                this.levelSelected--;
                this.game.switchOptionSound.play();
                if(this.levelSelected < 0){
                    this.levelSelected = this.levels.length - 1;
                }

                var level = {
                    dataType: dataTypes.CHANGELEVEL,
                    level: this.levelSelected                    
                }

                connection.send(JSON.stringify(level));     
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
            connection.onmessage = function(data){
                var parsedData = JSON.parse(data.data);

                if(parsedData.dataType == "9"){
                    Brainstein.game.switchOptionSound.play();

                    if(parsedData.currentLevel != "-1"){
                        Brainstein.LevelSelection.levelSelected = JSON.parse(parsedData.currentLevel);
                    }
                   
                    switch(JSON.parse(parsedData.currentLevel)){
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
                }
            }  
        }
    }
}

