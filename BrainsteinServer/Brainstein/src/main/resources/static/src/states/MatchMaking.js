var Brainstein = Brainstein || {};
Brainstein.MatchMaking = function(){};


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

Brainstein.MatchMaking = {

    create: function(){   
        this.game.stage.backgroundColor = '#39b5ad';

        this.alphatime = 0;
        this.alphaspeed = 0.05;

        this.matchMakingText = this.game.add.text(this.game.width / 2, 70, "MATCH MAKING", { font: "60px Chakra Petch", fill: "#0a2239", align: "center" });
        this.matchMakingText.anchor.setTo(0.5);
        this.numberOfPlayersText = this.game.add.text(this.game.width - 70, this.game.height - 10, "Players connected: ", { font: "30px Chakra Petch", fill: "#0a2239", align: "center" });
        this.numberOfPlayersText.anchor.setTo(1, 1);
        this.playerText = this.game.add.text(this.game.width / 2, 150, "You are: ", { font: "40px Chakra Petch", fill: "#0a2239", align: "center" });
        this.playerText.anchor.setTo(0.5);
        //sprites
        this.brainmm = this.game.add.sprite(this.game.width/2,this.game.height/2,'brainmm');
        this.brainmm.anchor.setTo(0.5, 0.5);

        this.erwinmm = this.game.add.sprite(this.game.width *0.1,this.game.height *0.6,'erwinmm');
        this.erwinmm.anchor.setTo(0.5, 0.5);
        this.erwinmm.angle = 135;

        this.darwinmm = this.game.add.sprite(this.game.width *0.9,this.game.height *0.6,'darwinmm');
        this.darwinmm.anchor.setTo(0.5, 0.5);
        this.darwinmm.angle = 45;       
  

        var data = {
            dataType: dataTypes.ENTERINGMATCHMAKING,
        }

        data = JSON.stringify(data);        
        
        connection.send(data);

    },

    update: function(){
        //movimientos y cambios visuales
        this.brainmm.angle += 1;

        this.darwinmm.alpha = Math.sin(this.alphatime);

        this.alphatime += this.alphaspeed; 
    
        var x = {
            dataType: dataTypes.CHECKOTHERPLAYERS,
        }
        
        connection.send(JSON.stringify(x));

        connection.onmessage = function(data){
            var parsedData = JSON.parse(data.data);          
            switch(parsedData.dataType){          
                case "8":
                    if(parsedData.allReady){
                        Brainstein.game.state.start("LevelSelection");
                    }
                    break;
            }       
        }       
    }
}