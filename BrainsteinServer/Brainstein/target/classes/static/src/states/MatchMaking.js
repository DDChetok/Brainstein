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
	GETID: 7,
	CHECKOTHERPLAYERS: 8
}

Brainstein.MatchMaking = {

    create: function(){

        Brainstein.userID = -1;    
        this.shouldChangeState = false; 

        this.game.stage.backgroundColor = '#39b5ad';
        this.matchMakingText = this.game.add.text(this.game.width / 2, 70, "MATCH MAKING", { font: "60px Chakra Petch", fill: "#0a2239", align: "center" });
        this.matchMakingText.anchor.setTo(0.5);
        this.numberOfPlayersText = this.game.add.text(this.game.width - 70, this.game.height - 10, "Players connected: ", { font: "30px Chakra Petch", fill: "#0a2239", align: "center" });
        this.numberOfPlayersText.anchor.setTo(1, 1);
        this.playerText = this.game.add.text(this.game.width / 2, 150, "You are: ", { font: "40px Chakra Petch", fill: "#0a2239", align: "center" });
        this.playerText.anchor.setTo(0.5);
    },

    update: function(){

        var x = {
            dataType: dataTypes.GETID,
        }

        connection.send(JSON.stringify(x));


        var x = {
            dataType: dataTypes.CHECKOTHERPLAYERS,
        }
        
        connection.send(JSON.stringify(x));

        connection.onmessage = function(data){
            var parsedData = JSON.parse(data.data);
            switch(parsedData.dataType){

                case "7":
                    if(Brainstein.userID == -1) Brainstein.userID = parsedData.ID;   
                    this.playerText.setText(Brainstein.userID); 
                    break;

                case "8":
                    if(parsedData.allReady){
                        this.state.start("LevelSelection");
                    }
                    break;
            }       
        }     
    },  
}