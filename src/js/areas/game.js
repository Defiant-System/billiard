
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
				Project.game.state.add("stop", stopState);
				Project.game.state.start("load");
				break;
			case "start-game":
				Project.game.state.start("stop");
				Self.els.hud.find(`.player.right .name`).data({ name: event.name || "Yasmin" });
				Self.els.hud.find(`.ball-slots li`).removeAttr("data-id").removeClass("potted");

				Project.levelComplete = false;
				Project.guideOn = 1;
				Project.aiRating = event.level || 2;
				Project.bestScore = 0;
				Project.numGames = 0;
				Project.bestTime = 0;
				
				Project.mode = +event.arg || 1;
				Project.levelName = "1player_" + String(Project.aiRating);
				Project.lastBreaker = "none";
				Project.game.state.start("play");
				break;
			case "game-stop":
				Project.game.state.start("stop");
				break;
			case "game-pause":
				if (playState.gameInfo && playState.gameInfo.gameRunning) {
					Project.game.halt = true;
					Project.game.paused = true;
				}
				break;
			case "game-resume":
				if (playState.gameInfo && playState.gameInfo.gameRunning) {
					Project.game.halt = false;
					Project.game.paused = false;
				}
				break;
			case "game-toggle-pause":
				if (Project.game.halt) {
					Self.dispatch({ type: "game-resume" });
				} else {
					Self.dispatch({ type: "game-pause" });
				}
				break;
		}
	}
}
