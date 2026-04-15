
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
			el;
		switch (event.type) {
			// system events
			case "window.init":
				break;
			// custom events
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
				break;
			// proxy event
			case "open-spin-setter":
				return Self.spinSetter.dispatch(event);
			default:
				el = event.el;
				if (!el && event.origin) el = event.origin.el;
				if (el) {
					let pEl = el.parents(`?div[data-area]`);
					if (!pEl.length) pEl = Self.els.showcase;
					if (pEl.length) {
						let name = pEl.data("area");
						return Self[name].dispatch(event);
					}
				}
		}
	},
	game: @import "./areas/game.js",
	spinSetter: @import "./areas/spin-setter.js",
};

window.exports = billiard;
