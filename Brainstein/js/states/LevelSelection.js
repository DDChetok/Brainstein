var Brainstein = Brainstein || {};
Brainstein.LevelSelection = function(){};
var num = 0;
var aux = 0;
Brainstein.LevelSelection = {
	create: function(){
		//Show background					
		this.background = this.game.add.sprite(0, 0, 'mainMenuSplash');		
		this.background.width = (this.game.width);
        this.background.height = (this.game.height);
        /*
        this.manoErwin = this.game.add.sprite(this.game.width/2, this.game.height * 2/3, 'mano');
        this.manoErwin.anchor.setTo(1,0);
        this.manoErwin.x = this.game.width /2;        
        this.manoDarwin = this.game.add.sprite(this.game.width/2, this.game.height * 2/3, 'mano');
        this.manoDarwin.scale.x *= -1;
        this.manoDarwin.anchor.setTo(1,0);
        */
       this.menuErwin = this.game.add.sprite(-5,-30, 'menuErwin');
       this.menuErwin.width = (this.game.width / 3);
       this.menuErwin.height = (this.game.height + this.game.height *0.2 );

       this.menuDarwin = this.game.add.sprite(this.game.width *2/3,-30, 'menuDarwin');	
       this.menuDarwin.width = (this.game.width / 3);
       this.menuDarwin.height = (this.game.height + this.game.height *0.2);
        
        this.levels = ["Laboratorio", "Zombiehenge", "Ratlabyrinth"];
        
        this.levelSelected = 0;

		//Start game text
		//var text = "Level selected: \n" + this.levels[this.levelSelected] + "\n<-  ->";
		//var style = {font: "30px Chakra Petch", fill: '#04f31d', align:"center"};
        //this.h = this.game.add.text(this.game.width / 2 - 100, this.game.height /2 + 20, " AAAAAAAAA", style);
        
	},

	update: function(){
        
		//this.manoErwin.x = this.manoErwin.x + Math.sin(aux);
        //this.manoDarwin.x = this.manoDarwin.x - Math.sin(aux);
        //aux =+ 3;
       this.menuErwin.y = this.menuErwin.y + Math.sin(num);
		this.menuErwin.x = this.menuErwin.x + Math.cos(num);
		this.menuDarwin.y = this.menuDarwin.y + Math.cos(num);
		this.menuDarwin.x = this.menuDarwin.x + Math.sin(num);
        num += 0.8;
        
		if(this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)){
            this.game.switchOptionSound.play();
			this.game.state.start('Game');
        }
        
        if(this.game.input.keyboard.justPressed(Phaser.Keyboard.RIGHT)){         
            this.levelSelected++;
            this.game.switchOptionSound.play();
            if(this.levelSelected > this.levels.length - 1){
                this.levelSelected = 0;
            }
        }

        if(this.game.input.keyboard.justPressed(Phaser.Keyboard.LEFT)){        
            this.levelSelected--;
            this.game.switchOptionSound.play();
            if(this.levelSelected < 0){
                this.levelSelected = this.levels.length - 1;
            }
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


	}

}

