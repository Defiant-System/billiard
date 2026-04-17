
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

let state = {"p1":[{"id":"b1","state":""},{"id":"b2","state":""},{"id":"b3","state":""},{"id":"b4","state":""},{"id":"b5","state":""},{"id":"b6","state":"potted"},{"id":"b7","state":""}],"p2":[{"id":"b9","state":""},{"id":"b10","state":""},{"id":"b11","state":""},{"id":"b12","state":"potted"},{"id":"b13","state":"potted"},{"id":"b14","state":""},{"id":"b15","state":"potted"}],"cue":{"x":392.735479,"y":67.974199},"balls":[{"x":39273.5479,"y":6797.4199},{"x":18364.2897,"y":26091.2899,"targetType":"SOLIDS"},{"x":19983.6955,"y":13832.9609,"targetType":"SOLIDS"},{"x":24539.3554,"y":20780.6278,"targetType":"SOLIDS"},{"x":15044.1497,"y":19414.3481,"targetType":"SOLIDS"},{"x":29967.1538,"y":3673.5693,"targetType":"SOLIDS"},{"x":-68124.2809,"y":-34033.1264,"targetType":"SOLIDS"},{"x":29637.2366,"y":-7413.3544,"targetType":"SOLIDS"},{"x":42782.5504,"y":-2223.4473,"targetType":"8 BALL"},{"x":39627.2423,"y":-5993.9949,"targetType":"STRIPES"},{"x":53724.4171,"y":-28461.2471,"targetType":"STRIPES"},{"x":53131.062,"y":-19767.0209,"targetType":"STRIPES"},{"x":70295.2821,"y":32818.9528,"targetType":"STRIPES"},{"x":-68422.9292,"y":33590.9773,"targetType":"STRIPES"},{"x":51520.8057,"y":5451.8491,"targetType":"STRIPES"},{"x":68920.5847,"y":33161.9828,"targetType":"STRIPES"}],"pottedBallArray":[6,12,15,13],"cueBallInHand":false,"turn":"p2"};


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
