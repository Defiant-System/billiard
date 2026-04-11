
const { Phaser } = await window.fetch("~/js/bundle.js");

@import "./modules/Ball.js"
@import "./modules/contactListener.js"
@import "./modules/billiardPhysics.js"
@import "./modules/levelData.js"
@import "./modules/maths.js"
@import "./modules/vector2d.js"
@import "./modules/render.js"
@import "./modules/sound.js"
@import "./modules/effects.js"
@import "./modules/timer.js"
@import "./modules/load.js"
@import "./modules/setup.js"
@import "./modules/gameController.js"

@import "./modules/test.js"


//global variables - persistent across states
const Project = {
	width: 1920,
	height: 1200,
	alertSent: false,
	tutorialPlayed: false,
};


const billiard = {
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
			cvs: window.find(".game-cvs"),
		};

		// start booting game
		this.dispatch({ type: "init-boot-sequence" });

		// DEV-ONLY-START
		Test.init(this);
		// DEV-ONLY-END
	},
	dispatch(event) {
		let Self = billiard,
			el;
		switch (event.type) {
			// system events
			case "window.init":
				break;
			// custom events
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
				break;
			case "init-boot-sequence":
				Project.APP = billiard;
				Project.game = new Phaser.Game(Project.width, Project.height, Phaser.CANVAS, Self.els.cvs[0], {}, true);
				Project.game.state.add("load", loadState);
				Project.game.state.add("play", playState);
				Project.game.state.start("load");
				break;
			case "start-game":
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
				break;
		}
	}
};

window.exports = billiard;
