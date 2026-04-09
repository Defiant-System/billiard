

var game = new Phaser.Game(1920, 1080, Phaser.CANVAS, "mygame", {}, true);
//ratio 1.484

//global variables - persistent across states
var projectInfo = new Object();
// Sound.on = true;
projectInfo.alertSent = false;
projectInfo.tutorialPlayed = false;


var bootState = {
	init: function() {
		
		window.find("#mygame").css({ maxWidth: "100%", maxHeight: "100%" });

        game.scale.pageAlignHorizontally = true;
		game.time.advancedTiming = true;
        game.scale.windowConstraints.bottom = "visual";
        //game.scale.windowConstraints.right = "visual";
        game.scale.pageAlignVertically = true;
        //game.scale.pageAlignHorizontally = true;
		game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

		//game.scale.maxHeight = clientHeight;
		//game.scale.maxWidth = clientHeight * 1024 / 690;
		//game.scale.forceOrientation(!1, !1);

        game.input.maxPointers = 1;
        // game.stage.disableVisibilityChange = famobi.hasFeature("external_focus");
	},

	preload: function() {
		//load preloader assets
		//this.load.image('bgL', 'images/bgL.png');
		//this.load.image('bgP', 'images/bgP.png');
		// this.load.image('title', 'images/title.png');
		// this.load.image('rack', 'images/rack.png');
		// this.load.image('loaderBase', 'images/loaderBase.png');
		// this.load.image('loaderFill', 'images/loaderFill.png');
		// this.load.image('loaderHighlight', 'images/loaderHighlight.png');
		//this.load.image('guiFrame', 'images/frame.png');
	},

	create: function () {
		//start the preloader state
		game.state.start("load");
	}
};


game.state.add("load", loadState);
game.state.add("play", playState);
game.state.add("boot", bootState);

game.state.start("boot");

