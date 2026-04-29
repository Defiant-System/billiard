
const { Phaser, PIXI } = await window.fetch("~/js/bundle.js");

@import "./modules/ball.js"
@import "./modules/contactListener.js"
@import "./modules/billiardPhysics.js"
@import "./modules/levelData.js"
@import "./modules/maths.js"
@import "./modules/vector2d.js"
@import "./modules/render.js"
@import "./modules/sound.js"
@import "./modules/load.js"
@import "./modules/playState.js"
@import "./modules/playStateUpdate.js"

@import "./modules/test.js"

//global variables - persistent across states
const ME = karaqu.user;

const Project = {
	width: 1920,
	height: 1200,
};


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

		// init settings
		this.settings.dispatch({ type: "init-settings" });
		// show intro view
		this.dispatch({ type: "switch-view", arg: "start" });

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
			case "window.close":
				Project.game.destroy(true);
				break;
			case "window.blur":
				Self.game.dispatch({ type: "game-pause" });
				break;
			case "window.focus":
				Self.game.dispatch({ type: "game-resume" });
				break;
			// custom events
			case "switch-view":
				Self.els.content.data({ show: event.arg });
				Self[event.arg].dispatch({ type: "init-view" });
				break;
			case "new-game":
				Self.game.dispatch({ type: "start-game", arg: +event.arg });
				break;
			case "restore-game":
				Self.game.dispatch({ type: "restore-state", state: TestState });
				break;
			case "toggle-sound-fx":
				break;
			case "toggle-music":
				break;
			case "output-pgn":
				value = playState.getState();
				console.log( JSON.stringify(value) );
				break;
			case "close-congratulations":
				Self.game.dispatch({ type: "game-stop" });
				Self.els.content.removeClass("game-won");
				Self.els.content.data({ show: "start" });
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
						console.log(pEl, name);
						return Self[name].dispatch(event);
					}
				}
		}
	},
	start: @import "./areas/start.js",
	settings: @import "./areas/settings.js",
	game: @import "./areas/game.js",
	winner: @import "./areas/winner.js",
	loser: @import "./areas/loser.js",
	spinSetter: @import "./areas/spin-setter.js",
};

window.exports = billiard;
