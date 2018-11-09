var Brainstein = Brainstein || {};
Brainstein.MainMenu = function(){};

Brainstein.MainMenu = {
	
	create: function(){
		this.game.mainMenuMusic = this.game.add.audio('mainMenuMusic');
		this.game.mainMenuMusic.loop = true;
		this.game.keyboardSound = this.game.add.audio('keyboardSound');
		this.game.pressEnterSound = this.game.add.audio('pressEnterSound');
		this.game.pressEnterSound.loop = true;
		this.game.switchOptionSound = this.game.add.audio('switchOptionSound');
		this.game.sound.setDecodedCallback([this.game.keyboardSound,this.game.mainMenuMusic,this.game.pressEnterSound,this.game.switchOptionSound], this.start, this);
	},

	start: function(){
		//this.game.keyboardSound.play();
		this.game.mainMenuMusic.play();
		this.h = this.game.add.text(this.game.width / 2 - 100, this.game.height /2 + 20, "  ", style);
		this.content = [
						"...entiendes lo que te digo?", 
						"Que nos vamos a morir todos ",
						"¡¡QUE NOS MORIMOS!! Hazme caso",
						"y huye o van a ir a por ti,",
						"ahora vienen por el cerebro",
						"y nosotros tenemos que ",
						"defenderlo. Corre. Huye.",
						"Ya vien.-.,l,sfdbfl.------sa",
						 "ESTÁN AQUÍ"];
	
		this.line = [];
		this.wordIndex = 0;
		this.lineIndex = 0;		
		this.wordDelay = 150; //150
		this.lineDelay = 250;	//250

		this.content2 = ["PRESS ENTER"];

		//Show background					
		this.background = this.game.add.sprite(0, 0, 'mainMenuSplashEnter');		
		this.background.width = (this.game.width);
		this.background.height = (this.game.height);
		var style = {font: "15px Chakra Petch", fill: '#04f31d', align:"center"};

		this.text = this.game.add.text(this.game.width/2 - 110, this.game.height/2 - 40, '', style);
		
		this.nextLine();

	},

	nextLine: function() {

		if (this.lineIndex === this.content.length)
		{
			//  We're finished
			this.game.keyboardSound.stop();
			this.game.pressEnterSound.play();
			this.text2 = this.game.add.text(this.game.width/2 - 110, this.game.height/2 + 170,this.content2,{font: "35px Chakra Petch", fill: '#04f31d', align:"center"});
			this.text2.alpha = 0;
			this.game.add.tween(this.text2).to( { alpha: 1 }, 3000, "Linear", true);
			return;
		}
	
		//  Split the current line on spaces, so one word per array element
		this.line = this.content[this.lineIndex].split(' ');
	
		//  Reset the word index to zero (the first word in the line)
		this.wordIndex = 0;
	
		//  Call the 'nextWord' function once for each word in the line (line.length)
		this.game.time.events.repeat(this.wordDelay, this.line.length, this.nextWord, this);
	
		//  Advance to the next line
		this.lineIndex++;
	
	},

	nextWord: function() {

		//  Add the next word onto the text string, followed by a space
		this.text.text = this.text.text.concat(this.line[this.wordIndex] + " ");
	 
		//  Advance the word index to the next word in the line
		this.wordIndex++;
	
		//  Last word?
		if (this.wordIndex === this.line.length)
		{
			//  Add a carriage return
			this.text.text = this.text.text.concat("\n");
	
			//  Get the next line after the lineDelay amount of ms has elapsed
			this.game.time.events.add(this.lineDelay, this.nextLine, this);
		}
		
	
	},

	update: function(){
		if(this.game.input.keyboard.isDown(Phaser.Keyboard.ENTER)){
			this.game.state.start('LevelSelection');
			this.game.switchOptionSound.play();
		}
	}


}