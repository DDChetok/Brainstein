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

        this.getUserID();
        this.connectUser();
    },

    update: function(){
        $.get("/matchMaking", function(playersConnected){
            Brainstein.MatchMaking.numberOfPlayersText.setText("Players connected: " + playersConnected);
            if(playersConnected >= 2){
                Brainstein.MatchMaking.shouldChangeState = true;
            }
        })  
        
        if(this.shouldChangeState){
            this.game.state.start("LevelSelection");
        }
        
        
    },

    getUserID: function(){
        $.get("/matchMaking", function(data){
            Brainstein.userID = data;
            Brainstein.MatchMaking.playerText.setText("You are PLAYER " + (data + 1));
        })       
    },

    connectUser: function(){
        var ID = {
            ID: Brainstein.userID
        };

        ID = JSON.stringify(ID);

        $.ajax("/matchMaking", 
            {
                method: "POST",
                data:  ID,
                processData: false,					
                
                headers:{
                    "Content-Type": "application/json"
                },
            }
        );
    },

   
}