
const loadState = {
	init() {
		Project.APP.els.cvs.css({ maxWidth: "100%", maxHeight: "100%" });
	    Project.game.scale.pageAlignHorizontally = true;
		Project.game.time.advancedTiming = true;
	    Project.game.scale.windowConstraints.bottom = "visual";
	    Project.game.scale.pageAlignVertically = true;
		Project.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	    Project.game.input.maxPointers = 1;

		Project.game.scale.setResizeCallback(this.onResize, this);
	},
	resizeGame(scale, bounds){ 

	},
	onResize(scale, bounds) {
		
	},
	preload() {
	    //load all game assets
	    this.load.image('pockets', '~/img/pockets.webp');
	    this.load.image('cloth', '~/img/cloth.webp');
	    this.load.image('tableTop', '~/img/tableTop.webp');

	    this.load.image('shade', '~/img/shade.png');
	    this.load.image('shadow', '~/img/shadow.png');
	    this.load.image('cue', '~/img/cue.webp');
	    this.load.image('cueShadow', '~/img/cueShadow.png');

	    this.load.spritesheet('solidsSpriteSheet', '~/img/solidsSpriteSheet.png', 48, 48, 9);
	    this.load.spritesheet('ballSpriteSheet9', '~/img/ballSpriteSheet9.png', 50, 50, 41);
	    this.load.spritesheet('ballSpriteSheet10', '~/img/ballSpriteSheet10.png', 50, 50, 41);
	    this.load.spritesheet('ballSpriteSheet11', '~/img/ballSpriteSheet11.png', 50, 50, 41);
	    this.load.spritesheet('ballSpriteSheet12', '~/img/ballSpriteSheet12.png', 50, 50, 41);
	    this.load.spritesheet('ballSpriteSheet13', '~/img/ballSpriteSheet13.png', 50, 50, 41);
	    this.load.spritesheet('ballSpriteSheet14', '~/img/ballSpriteSheet14.png', 50, 50, 41);
	    this.load.spritesheet('ballSpriteSheet15', '~/img/ballSpriteSheet15.png', 50, 50, 41);
	    this.load.spritesheet('spotSpriteSheet', '~/img/spotSpriteSheet.png', 38, 38, 16);

	    this.load.image('mover', '~/img/mover.png');
	    this.load.image('8ball', '~/img/8ball.png');
	    this.load.image('spinSetterSmall', '~/img/spinSetterLarge.png');
	    this.load.image('cueBallSpot', '~/img/cueBallSpot.png');
	    this.load.image('spinSetterZoom', '~/img/spinSetterZoom.png');
	    this.load.image('cueBallSpotZoom', '~/img/cueBallSpotZoom.png');
	    this.load.spritesheet('guiSolids', '~/img/guiSolids.png', 102,102);
	    this.load.spritesheet('guiStripes', '~/img/guiStripes.png', 101,102);

	    this.load.atlas('marker', '~/img/marker.png', '~/js/marker.json');

	    Project.game.load.bitmapFont('font1', '~/fonts/font1.png', '~/fonts/font1.fnt');
	    Project.game.load.bitmapFont('font2', '~/fonts/font2.png', '~/fonts/font2.fnt'); 
	    Project.game.load.bitmapFont('font3', '~/fonts/font3.png', '~/fonts/font3.fnt');
	    Project.game.load.bitmapFont('font5', '~/fonts/font5.png', '~/fonts/font5.fnt');
	    Project.game.load.bitmapFont('font6', '~/fonts/font6.png', '~/fonts/font6.fnt');
	    Project.game.load.bitmapFont('font7', '~/fonts/Font.png', '~/fonts/Font.fnt');

	    this.load.audio('ballHit', ['~/audio/ballHit2.mp3']);
	    this.load.audio('cushionHit', ['~/audio/cushionHit.mp3']);
	    this.load.audio('pocketHit', ['~/audio/pocketHit.mp3']);
	    this.load.audio('cueHit', ['~/audio/cueHit.mp3']);
	    this.load.audio('shimmer', ['~/audio/shimmer.mp3']);
	    this.load.audio('ding', ['~/audio/ding.mp3']);
	    this.load.audio('cheer', ['~/audio/cheer.mp3']);
	},
	create() {
		var loaderInfo = this.loaderInfo;

	    Project.levelComplete = false;
	    Project.guideOn = 1;
	    Project.aiRating = 2;
	    Project.bestScore = 0;
	    Project.numGames = 0;
	    Project.bestTime = 0;
		
		Project.mode = 1;
	    Project.levelName = "1player_" + String(Project.aiRating);
	    Project.lastBreaker = "none";
	    Project.tutorial = false;
	    Project.clickedHelpButton = false;
	    Project.game.state.start("play");
	},
	update() {

	},
	shutdown() {
		var loaderInfo = this.loaderInfo;
	    Project.game.scale.setResizeCallback(null, null);
		loaderInfo = null;
	}
};
