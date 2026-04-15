
const loadState = {
	init() {
		Project.APP.game.els.cvs.css({ maxWidth: "100%", maxHeight: "100%" });
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

	    this.load.image('shade', '~/img/shade.webp');
	    this.load.image('shadow', '~/img/shadow.webp');
	    this.load.image('cue', '~/img/cue.png');
	    // this.load.image('cueShadow', '~/img/cueShadow.png');

	    this.load.spritesheet('solidsSpriteSheet', '~/icons/solid-sprite-sheet.png', 48, 48, 9);
	    this.load.spritesheet('ballSpriteSheet9', '~/icons/ball-sprite-sheet-9.png', 50, 50, 41);
	    this.load.spritesheet('ballSpriteSheet10', '~/icons/ball-sprite-sheet-10.png', 50, 50, 41);
	    this.load.spritesheet('ballSpriteSheet11', '~/icons/ball-sprite-sheet-11.png', 50, 50, 41);
	    this.load.spritesheet('ballSpriteSheet12', '~/icons/ball-sprite-sheet-12.png', 50, 50, 41);
	    this.load.spritesheet('ballSpriteSheet13', '~/icons/ball-sprite-sheet-13.png', 50, 50, 41);
	    this.load.spritesheet('ballSpriteSheet14', '~/icons/ball-sprite-sheet-14.png', 50, 50, 41);
	    this.load.spritesheet('ballSpriteSheet15', '~/icons/ball-sprite-sheet-15.png', 50, 50, 41);
	    this.load.spritesheet('spotSpriteSheet', '~/img/spotSpriteSheet.png', 38, 38, 16);

	    this.load.image('mover', '~/img/mover.png');
	    // this.load.image('8ball', '~/img/8ball.png');
	    
	    // this.load.image('spinSetterSmall', '~/img/spinSetterLarge.png');
	    // this.load.image('cueBallSpot', '~/img/cueBallSpot.png');
	    // this.load.image('spinSetterZoom', '~/img/spinSetterZoom.webp');
	    // this.load.image('cueBallSpotZoom', '~/img/cueBallSpotZoom.png');

	    this.load.atlas('marker', '~/img/marker.png', '~/js/marker.json');

	    this.load.audio('ballHit', ['~/audio/ballHit2.mp3']);
	    this.load.audio('cushionHit', ['~/audio/cushionHit.mp3']);
	    this.load.audio('pocketHit', ['~/audio/pocketHit.mp3']);
	    this.load.audio('cueHit', ['~/audio/cueHit.mp3']);
	},
	create() {
	    Project.APP.game.dispatch({ type: "start-game" });
	},
	update() {

	},
	shutdown() {
		var loaderInfo = this.loaderInfo;
	    Project.game.scale.setResizeCallback(null, null);
		loaderInfo = null;
	}
};
