
const { Phaser, PIXI } = await window.fetch("~/js/bundle.js");

@import "./modules/ball.js"
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

let state = {"cue":{"cueBallInHand":false,"anchor":{"x":1,"y":0.5},"x":-34.5,"y":0},"balls":[{"x":17843.7368,"y":-7001.8473},{"x":-64337.1815,"y":-21370.0132,"targetType":"SOLIDS"},{"x":44482.9025,"y":9557.3541,"targetType":"SOLIDS"},{"x":46341.7053,"y":-27590.3284,"targetType":"SOLIDS"},{"x":4548.6045,"y":-10545.4074,"targetType":"SOLIDS"},{"x":-54087.5262,"y":-9278.1051,"targetType":"SOLIDS"},{"x":31155.7725,"y":-31641.3509,"targetType":"SOLIDS"},{"x":47368.1893,"y":4011.0317,"targetType":"SOLIDS"},{"x":42825.9887,"y":87.3826,"targetType":"8 BALL"},{"x":51929.4728,"y":-6105.0169,"targetType":"STRIPES"},{"x":48741.9362,"y":-15060.1634,"targetType":"STRIPES"},{"x":38486.5789,"y":-17865.3026,"targetType":"STRIPES"},{"x":28827.8392,"y":29882.7211,"targetType":"STRIPES"},{"x":51226.9956,"y":-19217.2917,"targetType":"STRIPES"},{"x":-39463.4329,"y":-12510.6466,"targetType":"STRIPES"},{"x":40833.3902,"y":-5127.6745,"targetType":"STRIPES"}],"pottedBallArray":[],"turn":"p1"};


const billiard = {
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
		};

		// init all sub-objects
		Object.keys(this)
			.filter(i => typeof this[i].init === "function")
			.map(i => this[i].init(this));

		// DEV-ONLY-START
		Test.init(this);
		// DEV-ONLY-END
	},
	dispatch(event) {
		let Self = billiard,
			name,
			value,
			el;
		switch (event.type) {
			// system events
			case "window.init":
				break;
			case "window.blur":
				Self.game.dispatch({ type: "game-pause" });
				break;
			case "window.focus":
				Self.game.dispatch({ type: "game-resume" });
				break;
			case "window.close":
				Self.game.dispatch({ type: "game-stop" });
				break;
			// custom events
			case "new-game":
				break;
			case "toggle-sound-fx":
				break;
			case "toggle-music":
				break;
			case "restore-state":
				playState.setState(state);
				break;
			case "output-pgn":
				value = playState.getState();
				console.log( JSON.stringify(value) );
				break;
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
				break;
			// proxy event
			case "open-spin-setter":
			case "close-spin-setter":
				return Self.spinSetter.dispatch(event);
			default:
				el = event.el;
				if (!el && event.origin) el = event.origin.el;
				if (el) {
					let pEl = el.parents(`?div[data-area]`);
					if (!pEl.length) pEl = Self.els.showcase;
					if (pEl && pEl.length) {
						name = pEl.data("area");
						return Self[name].dispatch(event);
					}
				}
		}
	},
	game: @import "./areas/game.js",
	spinSetter: @import "./areas/spin-setter.js",
};

window.exports = billiard;
