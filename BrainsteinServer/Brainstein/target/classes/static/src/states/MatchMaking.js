var Brainstein = Brainstein || {};
Brainstein.MatchMaking = function(){};

Brainstein.MatchMaking = {

    create: function(){

        Brainstein.userID;    
        this.shouldChangeState = false; 

        this.game.stage.backgroundColor = '#39b5ad';
        this.matchMakingText = this.game.add.text(this.game.width / 2, 70, "MATCH MAKING", { font: "60px Chakra Petch", fill: "#0a2239", align: "center" });
        this.matchMakingText.anchor.setTo(0.5);
        this.numberOfPlayersText = this.game.add.text(this.game.width - 70, this.game.height - 10, "Players connected: ", { font: "30px Chakra Petch", fill: "#0a2239", align: "center" });
        this.numberOfPlayersText.anchor.setTo(1, 1);
        this.playerText = this.game.add.text(this.game.width / 2, 150, "You are: ", { font: "40px Chakra Petch", fill: "#0a2239", align: "center" });
        this.playerText.anchor.setTo(0.5);

        var x = {
            dataType: dataTypes.MATCHMAKING,
        }

        connection.send(JSON.stringify(x));

        this.getUserID();
        this.connectUser();
    },

    update: function(){
        connection.onmessage(data){
            var parsedData = JSON.parse(data.data);

            if(parsedData.dataType == "7"){
                Brainstein.userID = parsedData.ID;
                if(parsedData.allReady){
                    this.state.start("LevelSelection");
                }
            }        
        }     
    },  
}