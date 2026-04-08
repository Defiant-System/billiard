
var loadState  = new Object();



loadState.init = function(){

	this.loaderInfo = new Object();
	var loaderInfo = this.loaderInfo;

	loaderInfo.loaderProgress = 0;


	game.scale.setResizeCallback(this.onResize, this);
	fenster.subscribeToOffsetUpdates(() => {
		this.onResize();
	});

	loaderInfo.loaderCanvas = new Phaser.Group(game, game.stage, 'loaderCanvas');

	loaderInfo.loaderCanvas.alpha = 0;

	loaderInfo.loaderCanvas.x = game.width / 2;
	loaderInfo.loaderCanvas.y = game.height / 2;
	game.stage.addChild(loaderInfo.loaderCanvas);

	
	//loaderInfo.bgL = new Phaser.Sprite(game, 0, 0, 'bgL');
	//loaderInfo.loaderCanvas.addChild(loaderInfo.bgL);
	//loaderInfo.bgL.anchor = new Point(.5, .5);
	//loaderInfo.bgL.visible = false;

	//loaderInfo.bgP = new Phaser.Sprite(game, 0, 0, 'bgP');
	//loaderInfo.loaderCanvas.addChild(loaderInfo.bgP);
	//loaderInfo.bgP.anchor = new Point(.5, .5);
	//loaderInfo.bgP.visible = false;

	loaderInfo.title = new Phaser.Sprite(game, 0, 0, 'title');
	loaderInfo.loaderCanvas.addChild(loaderInfo.title);
	loaderInfo.title.anchor = new Point(.5, .5);

	loaderInfo.rack = new Phaser.Sprite(game, 0, 0, 'rack');
	loaderInfo.loaderCanvas.addChild(loaderInfo.rack);
	loaderInfo.rack.anchor = new Point(.5, .5);
	

	loaderInfo.loaderBase = new Phaser.Sprite(game, 0, 800, 'loaderBase');
	loaderInfo.loaderBase.anchor = new Point(.5, 0);
	loaderInfo.loaderCanvas.addChild(loaderInfo.loaderBase);
	loaderInfo.loaderFill = new Phaser.Sprite(game, 0, 800, 'loaderFill');
	loaderInfo.loaderFill.anchor = new Point(.5, 0);
	loaderInfo.loaderCanvas.addChild(loaderInfo.loaderFill);

	loaderInfo.graphics = game.add.graphics(0, 0);
	loaderInfo.graphics.beginFill(0xffffff);
	loaderInfo.loaderFill.mask = loaderInfo.graphics;

	loaderInfo.loaderHighlight = new Phaser.Sprite(game, 0, 80, 'loaderHighlight');
	loaderInfo.loaderHighlight.anchor = new Point(.5, 0);
	loaderInfo.loaderCanvas.addChild(loaderInfo.loaderHighlight);

	loaderInfo.progress = new Object();
	loaderInfo.progress.val = 0;


	this.resizeGame();
	var tween = game.add.tween(loaderInfo.loaderCanvas).to({alpha: 1}, 1000, Phaser.Easing.Linear.None, true, 500);


}

loadState.resizeGame = function(scale, bounds){ 


		//console.log("resizing");
		var loaderInfo = this.loaderInfo;

        var clientWidth = Math.min(fenster.innerWidth, document.documentElement.clientWidth);
		var clientHeight = Math.min(fenster.innerHeight, document.documentElement.clientHeight);

		if(window.famobi.getOrientation() == "portrait"){

			//set to portrait mode
			//game.scale.setGameSize(690, 1024);
			game.scale.setGameSize(1080, 1920);
			loaderInfo.title.y = -(game.height / 2) * 0.5;

			//loaderInfo.bgL.visible = false;
			//loaderInfo.bgP.visible = true;
			

			//game.scale.maxHeight = clientHeight;
			//game.scale.maxWidth = clientHeight * 690 / 1024;




		}else{

			//set to landscape mode 
			//game.scale.setGameSize(1024, 690);
			game.scale.setGameSize(1920, 1080);
			loaderInfo.title.y = -(game.height / 2) * 0.6;
			//game.scale.maxHeight = clientHeight;
			//game.scale.maxWidth = clientHeight * 1024 / 690;

			//loaderInfo.bgL.visible = true;
			//loaderInfo.bgP.visible = false;

			
			
		}

		
		//objects which need moving but take the same values regardless of orientation (eg. relative to other items which have changed)
		
		
		var margin = String(Math.abs(clientHeight - document.getElementById("mygame").clientHeight) / 2) + "px";
    	//document.getElementById("game").style.marginTop = margin;
		
		loaderInfo.loaderCanvas.x = game.width / 2;
		loaderInfo.loaderCanvas.y = game.height / 2;
		//loaderInfo.bgL.x = 0;
		//loaderInfo.bgL.y = 0;
		loaderInfo.loaderBase.y = 0.6 * game.height / 2;
		loaderInfo.loaderFill.y = 0.6 * game.height / 2;
		loaderInfo.loaderHighlight.y = 0.6 * game.height / 2;
		
		loaderInfo.rack.y = (game.height / 2) * 0.1;

		//loaderInfo.graphics.clear();
		//loaderInfo.graphics.beginFill(0xffffff);
		//loaderInfo.graphics.drawRect( - 375/2, loaderInfo.loaderBase.y, game.load.progress * 3.75, 30);

		loaderInfo.graphics.clear();
	    loaderInfo.graphics.beginFill(0xffffff);
		//loaderInfo.graphics.drawRect(game.width / 2 - 375 / 2, game.height / 2, game.load.progress * 3.75, 30);
		//console.log("progress: " + loaderInfo.loaderProgress)
		loaderInfo.graphics.drawRect(game.width / 2 - 375 / 2, game.height / 2 + loaderInfo.loaderBase.y + 8, loaderInfo.loaderProgress * 3.75, 30);
		

		
		

}

loadState.onResize = function(scale, bounds) {

 	this.resizeGame(scale, bounds);
 	
}



loadState.preload = function(){


	
	//load all game assets
	this.load.spritesheet('muteButton', 'images/muteButton.png', 256, 256);
	this.load.spritesheet('playButton', 'images/playButton.png', 256, 256);
	this.load.spritesheet('playButton', 'images/playButton.png', 256, 256);
	this.load.spritesheet('quitButton', 'images/quitButton.png', 256, 256);
	this.load.spritesheet('replayButton', 'images/replayButton.png', 256, 256);
	this.load.spritesheet('helpButton', 'images/helpButton.png', 256, 256);
	this.load.spritesheet('statsButton', 'images/statsButton.png', 256, 256);
	this.load.spritesheet('settingsButton', 'images/settingsButton.png', 256, 256);

	//this.load.spritesheet('creditsButton', 'images/creditsButton.png', 100, 100);
	this.load.spritesheet('menuButton', 'images/menuButton.png', 256, 256);
	this.load.spritesheet('solidsSpriteSheet', 'images/solidsSpriteSheet.png', 48, 48, 9);
	this.load.spritesheet('ballSpriteSheet9', 'images/ballSpriteSheet9.png', 50, 50, 41);
	this.load.spritesheet('ballSpriteSheet10', 'images/ballSpriteSheet10.png', 50, 50, 41);
	this.load.spritesheet('ballSpriteSheet11', 'images/ballSpriteSheet11.png', 50, 50, 41);
	this.load.spritesheet('ballSpriteSheet12', 'images/ballSpriteSheet12.png', 50, 50, 41);
	this.load.spritesheet('ballSpriteSheet13', 'images/ballSpriteSheet13.png', 50, 50, 41);
	this.load.spritesheet('ballSpriteSheet14', 'images/ballSpriteSheet14.png', 50, 50, 41);
	this.load.spritesheet('ballSpriteSheet15', 'images/ballSpriteSheet15.png', 50, 50, 41);
	this.load.spritesheet('spotSpriteSheet', 'images/spotSpriteSheet.png', 38, 38, 16);
	this.load.spritesheet('bonusStarSpriteSheet', 'images/bonusStar.png', 59, 67, 1.5);
	this.load.spritesheet('mouseSprite', 'images/mouseSprite.png', 132,116);

	this.load.spritesheet('humanIcon', 'images/humanIcon.png', 256,256);
	this.load.spritesheet('aiIcon', 'images/aiIcon.png', 256,256);

	this.load.spritesheet('guiSolids', 'images/guiSolids.png', 102,102);
	this.load.spritesheet('guiStripes', 'images/guiStripes.png', 101,102);
	this.load.spritesheet('turnArrow', 'images/turnArrow.png', 128,128);
	this.load.spritesheet('pVpButton', 'images/pVpButton.png', 460,195);
	this.load.spritesheet('pVAIButton', 'images/pVAIButton.png', 460,195);
	this.load.spritesheet('aiLevel', 'images/aiLevel.png', 128,128);
	this.load.spritesheet('illegalContacts', 'images/illegalContacts.png', 345,137);
	this.load.spritesheet('illegalShots', 'images/illegalShots.png', 324, 324);
	this.load.spritesheet('switch', 'images/switch.png', 152, 55);
	
	this.load.spritesheet('plusButton', 'images/plusButton.png', 128, 128);
	this.load.spritesheet('minusButton', 'images/minusButton.png', 128, 128);

	


	

	this.load.atlas('marker', 'images/marker.png', 'assets/marker.json');
	


	game.load.bitmapFont('font1', 'assets/fonts/font1.png', 'assets/fonts/font1.fnt');
	game.load.bitmapFont('font2', 'assets/fonts/font2.png', 'assets/fonts/font2.fnt'); 
	game.load.bitmapFont('font3', 'assets/fonts/font3.png', 'assets/fonts/font3.fnt');
	//game.load.bitmapFont('font4', 'assets/fonts/font4.png', 'assets/fonts/font4.fnt');
	game.load.bitmapFont('font5', 'assets/fonts/font5.png', 'assets/fonts/font5.fnt');
	game.load.bitmapFont('font6', 'assets/fonts/font6.png', 'assets/fonts/font6.fnt');
	
	game.load.bitmapFont('font7', 'assets/fonts/Font.png', 'assets/fonts/Font.fnt');

	this.load.image('more_games', window.famobi.getBrandingButtonImage());
    //this.load.image('line', 'images/line.png');
	this.load.image('pockets', 'images/pockets.png');
	this.load.image('cloth', 'images/cloth.png');
	this.load.image('tableTop', 'images/tableTop.png');
	this.load.image('shade', 'images/shade.png');
	this.load.image('shadow', 'images/shadow.png');
	this.load.image('cue', 'images/cue.png');
	this.load.image('cueShadow', 'images/cueShadow.png');
	//this.load.image('guiBar', 'images/guiBar.png');
	this.load.image('bonusDisc', 'images/bonusDisc.png');
	this.load.image('powerBarBase', 'images/powerBarBase.png');
	this.load.image('powerBarTop', 'images/powerBarTop.png');
	this.load.image('powerBarBG', 'images/powerBarBG.png');


	//this.load.image('backgroundImageL', 'images/bgLandscape2.png');
	//this.load.image('backgroundImageP', 'images/bgPortrait2.png');
	this.load.image('bonusStar', 'images/bonusStar2.png');
	//this.load.image('box', 'images/box.png');
	this.load.image('panel', 'images/panel.png');
	this.load.image('panel2', 'images/panel2.png');
	this.load.image('panel3', 'images/panel3.png');
	let externalMute = famobi.hasFeature("external_mute");
	this.load.image('panel4', externalMute ? 'images/panel4e.png' : 'images/panel4d.png');
	//this.load.image('phaserLogo', 'images/phaserLogo.png');
	//this.load.image('andromedusLogo', 'images/andromedusLogo.jpg');
	this.load.image('helpMouse', 'images/helpMouse.png');
	this.load.image('helpTouch', 'images/helpTouch.png');
	this.load.image('guiPanel1', 'images/guiPanel1.png');
	this.load.image('guiPanel2', 'images/guiPanel2.png');
	this.load.image('score', 'images/score.png');
	this.load.image('highScore', 'images/highscore.png');
	this.load.image('success', 'images/success.png');
	this.load.image('hand', 'images/hand.png');
	this.load.image('dottedLine', 'images/dottedLine.png');
	this.load.image('rackBG', 'images/rackBG.png');
	this.load.image('mover', 'images/mover.png');
	this.load.image('8ball', 'images/8ball.png');
	this.load.image('spinSetterSmall', 'images/spinSetterLarge.png');
	this.load.image('cueBallSpot', 'images/cueBallSpot.png');
	this.load.image('spinSetterZoom', 'images/spinSetterZoom.png');
	this.load.image('cueBallSpotZoom', 'images/cueBallSpotZoom.png');
	this.load.image('clockIcon', 'images/clockIcon.png');
	this.load.image('aiWin', 'images/aiWin.png');
	this.load.image('playerWin', 'images/playerWin.png');
	this.load.image('rosette', 'images/rosette.png');
	this.load.image('illegalBreak', 'images/illegalBreak.png');
	this.load.image('foulDisplay', 'images/foulDisplay.png');
	this.load.image('foulHighlight', 'images/foulHighlight.png');
	this.load.image('cross', 'images/cross.png');
	this.load.image('tick', 'images/tick.png');
	this.load.image('gameController', 'images/gameController.png');
	this.load.image('famobi', 'images/famobi.png');


	this.load.audio('ballHit', ['assets/audio/ballHit2.wav', 'assets/audio/ballHit2.mp3']);
	this.load.audio('cushionHit', ['assets/audio/cushionHit.wav', 'assets/audio/cushionHit.mp3']);
	this.load.audio('pocketHit', ['assets/audio/pocketHit.wav', 'assets/audio/pocketHit.mp3']);
	this.load.audio('cueHit', ['assets/audio/cueHit.wav', 'assets/audio/cueHit.mp3']);
	this.load.audio('shimmer', ['assets/audio/shimmer.wav', 'assets/audio/shimmer.mp3']);
	this.load.audio('ding', ['assets/audio/ding.wav', 'assets/audio/ding.mp3']);
	this.load.audio('cheer', ['assets/audio/cheer.wav', 'assets/audio/cheer.mp3']);

	game.load.onFileComplete.add(this.updateProgressBar, this);

}

loadState.updateProgressBar = function() {   

	var loaderInfo = this.loaderInfo;
	
	
	//console.log("loader: " + game.load.progress);
	loaderInfo.loaderProgress = game.load.progress;
	

	//loaderInfo.graphics.drawRect(loaderInfo.loaderCanvas.x - 375/2, loaderInfo.loaderCanvas.y, game.load.progress * 3.75, 30);
	//loaderInfo.graphics.drawRect(loaderInfo.loaderCanvas.x + loaderInfo.loaderBase.x - (375/2), loaderInfo.loaderCanvas.y + loaderInfo.loaderBase.y + 8, loaderInfo.progress.val, 30);
	
	loaderInfo.graphics.clear();
    loaderInfo.graphics.beginFill(0xffffff);
	loaderInfo.graphics.drawRect(game.width / 2 - 375 / 2, game.height / 2 + loaderInfo.loaderBase.y + 8, loaderInfo.loaderProgress * 3.75, 30);
	

	//tween = game.add.tween(loaderInfo.progress).to({val: game.load.progress * 3.75}, 3000, Phaser.Easing.Linear.None,true);
}



loadState.render = function(){

	//var loaderInfo = this.loaderInfo;
	//loaderInfo.graphics.drawRect(loaderInfo.loaderBase.x - (375/2), loaderInfo.loaderBase.y + 8, loaderInfo.progress.val, 30);
}

loadState.create = function(){

	var loaderInfo = this.loaderInfo;

	//console.log("loaded");
	game.time.events.add(Phaser.Timer.SECOND * 2, fadeLoader, this);

	function fadeLoader(){

		//initMenu();
		var tween = game.add.tween(loaderInfo.loaderCanvas).to({alpha: 0}, 1000, Phaser.Easing.Linear.None, true);
		tween.onComplete.add(initMenu, this);
	}

	function initMenu(){

		//console.log("tween complete");
		initProjectInfo(); 
		game.state.start('mainMenu');


		function initProjectInfo(){

			//one time initiation routine after game load and before main menu
			projectInfo.levelComplete = false;
		}
	}



	
}



loadState.update = function(){

	//console.log("updating");




}

loadState.shutdown = function(){

	var loaderInfo = this.loaderInfo;

	//console.log("cleaning loader");
	game.stage.removeChild(loaderInfo.loaderCanvas);
	loaderInfo.loaderCanvas = null;
	loaderInfo = null;
}


	
  

