var Brainstein = Brainstein || {};
Brainstein.game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, ' ');

Brainstein.game.state.add('Boot', Brainstein.Boot);
Brainstein.game.state.add('Preload', Brainstein.Preload);
Brainstein.game.state.add('MainMenu', Brainstein.MainMenu);
Brainstein.game.state.add('MatchMaking', Brainstein.MatchMaking);
Brainstein.game.state.add('LevelSelection', Brainstein.LevelSelection);
Brainstein.game.state.add('Game', Brainstein.Game);
Brainstein.game.state.add('GameOver', Brainstein.GameOver);

var connection = new WebSocket('ws://' + window.location.host + '/brainstein');

console.log(connection);

var isSocketOpen = false;

connection.onopen = function(data){
    isSocketOpen = true;
    console.log("Abrido");
}

connection.onmessage = function(data){
    var parsedData = JSON.parse(data.data);

    if(parsedData.dataType == "7"){
        Brainstein.userID = JSON.parse(parsedData.ID);
        console.log("User ID: " + Brainstein.userID);
    }
}

Brainstein.game.state.start('Boot');

