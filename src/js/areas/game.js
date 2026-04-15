
// billiard.game

{
	init() {
		// fast references
		this.els = {
			el: window.find(".game-view"),
			cvs: window.find(".game-cvs"),
			hud: window.find(".hud"),
		};
		// start booting game
		this.dispatch({ type: "init-boot-sequence" });
	},
	dispatch(event) {
		let APP = billiard,
			Self = APP.game,
			value,
			el;
		// console.log(event);
		switch (event.type) {
			case "init-boot-sequence":
				Project.APP = APP;
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
}
