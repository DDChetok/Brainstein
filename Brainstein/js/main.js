var Brainstein = Brainstein || {};
Brainstein.game = new Phaser.Game(1024, 600, Phaser.AUTO, ' ');

Brainstein.game.state.add('Boot', Brainstein.Boot);
Brainstein.game.state.add('Preload', Brainstein.Preload);
Brainstein.game.state.add('MainMenu', Brainstein.MainMenu);
Brainstein.game.state.add('LevelSelection', Brainstein.LevelSelection);
Brainstein.game.state.add('Game', Brainstein.Game);
Brainstein.game.state.add('GameOver', Brainstein.GameOver);

Brainstein.game.state.start('Boot');