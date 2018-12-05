var Brainstein = Brainstein || {};
Brainstein.MatchMaking = function(){};

Brainstein.MatchMaking = {

    create: function(){

        Brainstein.userID;    
        this.shouldChangeState = false; 

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
        
        this.getUserID();
        this.connectUser();
    },

    update: function(){
        //movimientos y cambios visuales
        this.brainmm.angle += 1;

        this.darwinmm.alpha = Math.sin(this.alphatime);

        this.alphatime += this.alphaspeed;
        

        $.get("/matchMaking", function(playersConnected){
            Brainstein.MatchMaking.numberOfPlayersText.setText("Players connected: " + playersConnected);
            if(playersConnected >= 2){
                Brainstein.MatchMaking.shouldChangeState = true;
            }
        })  
        
        if(this.shouldChangeState && Brainstein.userID != undefined){
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