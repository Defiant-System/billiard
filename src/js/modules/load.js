
var loadState  = new Object();

loadState.init = function() {

	this.loaderInfo = new Object();
	var loaderInfo = this.loaderInfo;
	loaderInfo.loaderProgress = 0;

	game.scale.setResizeCallback(this.onResize, this);
	// fenster.subscribeToOffsetUpdates(() => {
	// 	this.onResize();
	// });

	loaderInfo.loaderCanvas = new Phaser.Group(game, game.stage, 'loaderCanvas');
	loaderInfo.loaderCanvas.alpha = 0;
	loaderInfo.loaderCanvas.x = game.width / 2;
	loaderInfo.loaderCanvas.y = game.height / 2;
	game.stage.addChild(loaderInfo.loaderCanvas);

	/*
	loaderInfo.title = new Phaser.Sprite(game, 0, 0, 'title');
	loaderInfo.loaderCanvas.addChild(loaderInfo.title);
	loaderInfo.title.anchor = new Point(.5, .5);

	loaderInfo.rack = new Phaser.Sprite(game, 0, 0, 'rack');
	loaderInfo.loaderCanvas.addChild(loaderInfo.rack);
	loaderInfo.rack.anchor = new Point(.5, .5);
	*/
	

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
    var clientWidth = Math.min(window.innerWidth, document.documentElement.clientWidth);
	var clientHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);

	//set to landscape mode 
	//game.scale.setGameSize(1024, 690);
	game.scale.setGameSize(1920, 1080);
	// loaderInfo.title.y = -(game.height / 2) * 0.6;
	//game.scale.maxHeight = clientHeight;
	//game.scale.maxWidth = clientHeight * 1024 / 690;
	//loaderInfo.bgL.visible = true;
	//loaderInfo.bgP.visible = false;
	
	//objects which need moving but take the same values regardless of orientation (eg. relative to other items which have changed)
	
	var margin = String(Math.abs(clientHeight - document.getElementById("mygame").clientHeight) / 2) + "px";
	//document.getElementById("game").style.marginTop = margin;
	
	// loaderInfo.loaderCanvas.x = game.width / 2;
	// loaderInfo.loaderCanvas.y = game.height / 2;
	//loaderInfo.bgL.x = 0;
	//loaderInfo.bgL.y = 0;
	// loaderInfo.loaderBase.y = 0.6 * game.height / 2;
	// loaderInfo.loaderFill.y = 0.6 * game.height / 2;
	// loaderInfo.loaderHighlight.y = 0.6 * game.height / 2;
	
	// loaderInfo.rack.y = (game.height / 2) * 0.1;

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
	// console.log("onResize");
 	this.resizeGame(scale, bounds);
}



loadState.preload = function() {
    //load all game assets
    // this.load.spritesheet('muteButton', '~/img/muteButton.png', 256, 256);
    // this.load.spritesheet('playButton', '~/img/playButton.png', 256, 256);
    // this.load.spritesheet('playButton', '~/img/playButton.png', 256, 256);
    // this.load.spritesheet('quitButton', '~/img/quitButton.png', 256, 256);
    // this.load.spritesheet('replayButton', '~/img/replayButton.png', 256, 256);
    // this.load.spritesheet('helpButton', '~/img/helpButton.png', 256, 256);
    // this.load.spritesheet('statsButton', '~/img/statsButton.png', 256, 256);
    // this.load.spritesheet('settingsButton', '~/img/settingsButton.png', 256, 256);

    // this.load.image('more_games', window.famobi.getBrandingButtonImage());
    //this.load.image('line', '~/img/line.png');
    this.load.image('pockets', '~/img/pockets.webp');
    this.load.image('cloth', '~/img/cloth.webp');
    this.load.image('tableTop', '~/img/tableTop.webp');

    this.load.image('shade', '~/img/shade.png');
    this.load.image('shadow', '~/img/shadow.png');
    this.load.image('cue', '~/img/cue.webp');
    this.load.image('cueShadow', '~/img/cueShadow.png');
    //this.load.image('guiBar', '~/img/guiBar.png');
    // this.load.image('bonusDisc', '~/img/bonusDisc.png');
    // this.load.image('powerBarBase', '~/img/powerBarBase.png');
    // this.load.image('powerBarTop', '~/img/powerBarTop.png');
    // this.load.image('powerBarBG', '~/img/powerBarBG.png');

    //this.load.spritesheet('creditsButton', '~/img/creditsButton.png', 100, 100);
    // this.load.spritesheet('menuButton', '~/img/menuButton.png', 256, 256);
    this.load.spritesheet('solidsSpriteSheet', '~/img/solidsSpriteSheet.png', 48, 48, 9);
    this.load.spritesheet('ballSpriteSheet9', '~/img/ballSpriteSheet9.png', 50, 50, 41);
    this.load.spritesheet('ballSpriteSheet10', '~/img/ballSpriteSheet10.png', 50, 50, 41);
    this.load.spritesheet('ballSpriteSheet11', '~/img/ballSpriteSheet11.png', 50, 50, 41);
    this.load.spritesheet('ballSpriteSheet12', '~/img/ballSpriteSheet12.png', 50, 50, 41);
    this.load.spritesheet('ballSpriteSheet13', '~/img/ballSpriteSheet13.png', 50, 50, 41);
    this.load.spritesheet('ballSpriteSheet14', '~/img/ballSpriteSheet14.png', 50, 50, 41);
    this.load.spritesheet('ballSpriteSheet15', '~/img/ballSpriteSheet15.png', 50, 50, 41);
    this.load.spritesheet('spotSpriteSheet', '~/img/spotSpriteSheet.png', 38, 38, 16);
    // this.load.spritesheet('bonusStarSpriteSheet', '~/img/bonusStar.png', 59, 67, 1.5);
    // this.load.spritesheet('mouseSprite', '~/img/mouseSprite.png', 132,116);

    // this.load.spritesheet('humanIcon', '~/img/humanIcon.png', 256,256);
    // this.load.spritesheet('aiIcon', '~/img/aiIcon.png', 256,256);

    this.load.image('mover', '~/img/mover.png');
    this.load.image('8ball', '~/img/8ball.png');
    this.load.image('spinSetterSmall', '~/img/spinSetterLarge.png');
    this.load.image('cueBallSpot', '~/img/cueBallSpot.png');
    this.load.image('spinSetterZoom', '~/img/spinSetterZoom.png');
    this.load.image('cueBallSpotZoom', '~/img/cueBallSpotZoom.png');
    this.load.spritesheet('guiSolids', '~/img/guiSolids.png', 102,102);
    this.load.spritesheet('guiStripes', '~/img/guiStripes.png', 101,102);

    this.load.atlas('marker', '~/img/marker.png', '~/js/marker.json');

    game.load.bitmapFont('font1', '~/fonts/font1.png', '~/fonts/font1.fnt');
    game.load.bitmapFont('font2', '~/fonts/font2.png', '~/fonts/font2.fnt'); 
    game.load.bitmapFont('font3', '~/fonts/font3.png', '~/fonts/font3.fnt');
    //game.load.bitmapFont('font4', '~/fonts/font4.png', '~/fonts/font4.fnt');
    game.load.bitmapFont('font5', '~/fonts/font5.png', '~/fonts/font5.fnt');
    game.load.bitmapFont('font6', '~/fonts/font6.png', '~/fonts/font6.fnt');
    game.load.bitmapFont('font7', '~/fonts/Font.png', '~/fonts/Font.fnt');

    /*
    this.load.spritesheet('turnArrow', '~/img/turnArrow.png', 128,128);
    // this.load.spritesheet('pVpButton', '~/img/pVpButton.png', 460,195);
    // this.load.spritesheet('pVAIButton', '~/img/pVAIButton.png', 460,195);
    // this.load.spritesheet('aiLevel', '~/img/aiLevel.png', 128,128);
    this.load.spritesheet('illegalContacts', '~/img/illegalContacts.png', 345,137);
    this.load.spritesheet('illegalShots', '~/img/illegalShots.png', 324, 324);
    // this.load.spritesheet('switch', '~/img/switch.png', 152, 55);
    
    // this.load.spritesheet('plusButton', '~/img/plusButton.png', 128, 128);
    // this.load.spritesheet('minusButton', '~/img/minusButton.png', 128, 128);

    //this.load.image('backgroundImageL', '~/img/bgLandscape2.png');
    //this.load.image('backgroundImageP', '~/img/bgPortrait2.png');
    // this.load.image('bonusStar', '~/img/bonusStar2.png');
    //this.load.image('box', '~/img/box.png');
    // this.load.image('panel', '~/img/panel.png');
    // this.load.image('panel2', '~/img/panel2.png');
    // this.load.image('panel3', '~/img/panel3.png');
    // let externalMute = famobi.hasFeature("external_mute");
    // this.load.image('panel4', externalMute ? '~/img/panel4e.png' : '~/img/panel4d.png');
    //this.load.image('phaserLogo', '~/img/phaserLogo.png');
    //this.load.image('andromedusLogo', '~/img/andromedusLogo.jpg');
    // this.load.image('helpMouse', '~/img/helpMouse.png');
    // this.load.image('helpTouch', '~/img/helpTouch.png');
    // this.load.image('guiPanel1', '~/img/guiPanel1.png');
    // this.load.image('guiPanel2', '~/img/guiPanel2.png');
    // this.load.image('score', '~/img/score.png');
    // this.load.image('highScore', '~/img/highscore.png');
    // this.load.image('success', '~/img/success.png');
    // this.load.image('hand', '~/img/hand.png');
    // this.load.image('dottedLine', '~/img/dottedLine.png');
    // this.load.image('rackBG', '~/img/rackBG.png');
    // this.load.image('clockIcon', '~/img/clockIcon.png');
    // this.load.image('aiWin', '~/img/aiWin.png');
    // this.load.image('playerWin', '~/img/playerWin.png');
    // this.load.image('rosette', '~/img/rosette.png');
    this.load.image('illegalBreak', '~/img/illegalBreak.png');
    this.load.image('foulDisplay', '~/img/foulDisplay.png');
    this.load.image('foulHighlight', '~/img/foulHighlight.png');
    // this.load.image('cross', '~/img/cross.png');
    // this.load.image('tick', '~/img/tick.png');
    // this.load.image('gameController', '~/img/gameController.png');
    // this.load.image('famobi', '~/img/famobi.png');
    */

    this.load.audio('ballHit', ['~/audio/ballHit2.mp3']);
    this.load.audio('cushionHit', ['~/audio/cushionHit.mp3']);
    this.load.audio('pocketHit', ['~/audio/pocketHit.mp3']);
    this.load.audio('cueHit', ['~/audio/cueHit.mp3']);
    this.load.audio('shimmer', ['~/audio/shimmer.mp3']);
    this.load.audio('ding', ['~/audio/ding.mp3']);
    this.load.audio('cheer', ['~/audio/cheer.mp3']);
	
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



loadState.render = function() {
	//var loaderInfo = this.loaderInfo;
	//loaderInfo.graphics.drawRect(loaderInfo.loaderBase.x - (375/2), loaderInfo.loaderBase.y + 8, loaderInfo.progress.val, 30);
}

loadState.create = function() {
	var loaderInfo = this.loaderInfo;

    projectInfo.levelComplete = false;
    projectInfo.guideOn = 1;
    projectInfo.aiRating = 2;
    projectInfo.bestScore = 0;
    projectInfo.numGames = 0;
    projectInfo.bestTime = 0;
	
	projectInfo.mode = 2;
    projectInfo.levelName = "1player_" + String(projectInfo.aiRating);
    projectInfo.lastBreaker = "none";
    projectInfo.tutorial = false;
    projectInfo.clickedHelpButton = false;
    game.state.start("play");
    console.log("play");
}

loadState.update = function() {

}

loadState.shutdown = function() {
	var loaderInfo = this.loaderInfo;
	// console.log("cleaning loader");
    game.scale.setResizeCallback(null, null);
	game.stage.removeChild(loaderInfo.loaderCanvas);
	loaderInfo.loaderCanvas = null;
	loaderInfo = null;
}
  

